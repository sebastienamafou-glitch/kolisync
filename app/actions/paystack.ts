"use server";

import { getSession } from "@/lib/session";

export async function initializeDepositAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "DRIVER") {
    return { error: "Non autorisé" };
  }

  const amountStr = formData.get("amount");
  const amount = parseInt(amountStr as string, 10);
  
  if (isNaN(amount) || amount < 100) {
    return { error: "Montant minimum : 100 FCFA" };
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("Clé secrète Paystack introuvable.");

  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100, // Paystack traite toujours en centimes/kobo
        email: `driver_${session.userId}@kolisync.com`, // L'email est requis par Paystack, on le génère si absent
        currency: "XOF", // Franc CFA
        metadata: {
          userId: session.userId,
          custom_fields: [
            {
              display_name: "Type de transaction",
              variable_name: "tx_type",
              value: "WALLET_DEPOSIT"
            }
          ]
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/pwa/wallet`, // Redirection après paiement
      }),
    });

    const data = await response.json();

    if (data.status && data.data?.authorization_url) {
      return { url: data.data.authorization_url };
    } else {
      console.error("Erreur Paystack :", data.message);
      return { error: "Impossible de générer le lien de paiement." };
    }
  } catch {
    return { error: "Erreur réseau lors de la communication avec Paystack." };
  }
}
