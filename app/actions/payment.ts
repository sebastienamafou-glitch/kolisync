"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function createSubscriptionPaymentAction(formData: FormData) {
  const session = await getSession();
  
  if (!session || session.role !== "OWNER") {
    return { error: "Seul le propriétaire peut souscrire à l'abonnement." };
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  // 🚨 MOCK MODE (Environnement de Développement)
  // Si aucune clé Paystack n'est configurée, on simule un paiement réussi pour pouvoir tester l'UX.
  if (!secretKey) {
    console.log("⚠️ [MOCK MODE] Aucune clé Paystack trouvée. Simulation d'un paiement réussi...");
    
    await prisma.tenant.update({
      where: { id: session.tenantId },
      data: { isPro: true },
    });

    // Redirection immédiate vers la page d'upgrade pour voir le "Plan Pro Actif"
    redirect("/b2b/upgrade");
  }

  // 🌍 MODE PRODUCTION (Quand tu auras tes clés Paystack)
  // 🚨 Aligné sur le prix de 10 000 FCFA communiqué dans l'interface B2B
  const amount = 10000; 

  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100, // Paystack attend des centimes
        email: `tenant_${session.tenantId}@kolisync.com`,
        currency: "XOF",
        metadata: {
          tenantId: session.tenantId,
          userId: session.userId,
          custom_fields: [
            {
              display_name: "Type de transaction",
              variable_name: "tx_type",
              value: "PRO_SUBSCRIPTION"
            }
          ]
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/b2b/settings`,
      }),
    });

    const data = await response.json();

    if (data.status && data.data?.authorization_url) {
      redirect(data.data.authorization_url);
    } else {
      return { error: "Service de paiement temporairement indisponible." };
    }

  } catch (err) {
    // Laisse Next.js gérer son exception interne pour la redirection
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err; 
    }
    return { error: "Erreur réseau lors de la communication avec le service de paiement." };
  }
}
