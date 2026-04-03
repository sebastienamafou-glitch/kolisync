"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prismaAdmin from "@/lib/prisma-admin";
import { getSession } from "@/lib/session";

export async function requestWithdrawalAction(prevState: unknown, formData: FormData) {
  const session = await getSession();
  
  if (!session || session.role !== "DRIVER") {
    return { error: "Action non autorisée." };
  }

  const amountStr = formData.get("amount") as string;
  const phone = formData.get("phone") as string;
  
  const amount = parseInt(amountStr, 10);

  if (isNaN(amount) || amount < 1000) {
    return { error: "Le montant minimum de retrait est de 1 000 FCFA." };
  }

  if (!phone || phone.replace(/\s/g, "").length < 8) {
    return { error: "Veuillez fournir un numéro Mobile Money valide." };
  }

  try {
    const wallet = await prismaAdmin.socialWallet.findUnique({
      where: { userId: session.userId }
    });

    if (!wallet || wallet.balance < amount) {
      return { error: "Solde insuffisant pour effectuer ce retrait." };
    }

    // Transaction Prisma : On déduit le solde et on trace le retrait (PAYOUT)
    await prismaAdmin.$transaction(async (tx) => {
      await tx.socialTransaction.create({
        data: {
          walletId: wallet.id,
          amount: -amount, // Montant négatif pour un retrait
          type: "PAYOUT",
        }
      });

      await tx.socialWallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } }
      });
    });

  } catch (error) {
    console.error("Erreur lors du retrait :", error);
    return { error: "Une erreur est survenue lors du traitement de votre demande." };
  }

  // Redirection hors du try/catch pour que Next.js puisse l'exécuter
  revalidatePath("/pwa/wallet");
  redirect("/pwa/wallet");
}
