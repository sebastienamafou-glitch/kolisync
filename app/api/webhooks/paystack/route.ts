import crypto from "crypto";
import { NextResponse } from "next/server";
import prismaAdmin from "@/lib/prisma-admin";

export async function POST(req: Request) {
  try {
    // 1. Extraction du corps brut et de la signature
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret || !signature) {
      return NextResponse.json({ error: "Configuration invalide" }, { status: 400 });
    }

    // 2. Vérification cryptographique stricte (HMAC SHA512)
    const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    if (hash !== signature) {
      return NextResponse.json({ error: "Signature rejetée" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // 3. Traitement exclusif des succès de paiement
    if (event.event === "charge.success") {
      const { amount, metadata } = event.data;
      const realAmount = amount / 100; // Reconversion des centimes en FCFA
      
      // Extraction du type de transaction depuis les custom_fields Paystack
      const txType = metadata?.custom_fields?.find(
        (field: { variable_name: string; value: string }) => field.variable_name === "tx_type"
      )?.value;

      // ── ROUTE 1 : RECHARGEMENT PORTEFEUILLE LIVREUR ──
      if (txType === "WALLET_DEPOSIT" || !txType) {
        const userId = metadata?.userId;

        if (userId) {
          const wallet = await prismaAdmin.socialWallet.findUnique({
            where: { userId }
          });

          if (wallet) {
            await prismaAdmin.$transaction(async (tx) => {
              await tx.socialTransaction.create({
                data: {
                  walletId: wallet.id,
                  amount: realAmount,
                  type: "ADJUSTMENT",
                }
              });

              await tx.socialWallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: realAmount } }
              });
            });
          }
        }
      } 
      // ── ROUTE 2 : ABONNEMENT PRO VENDEUR ──
      else if (txType === "PRO_SUBSCRIPTION") {
        const tenantId = metadata?.tenantId;

        if (tenantId) {
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 30); // Ajoute 30 jours

          await prismaAdmin.tenant.update({
            where: { id: tenantId },
            data: {
              isPro: true,
              subscriptionEndsAt: expirationDate,
            }
          });
        }
      }
    }

    // 4. Réponse 200 immédiate exigée par Paystack
    return NextResponse.json({ received: true }, { status: 200 });

  } catch {
    return NextResponse.json({ error: "Erreur interne du webhook" }, { status: 500 });
  }
}
