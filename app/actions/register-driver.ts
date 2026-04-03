"use server";

import { redirect } from "next/navigation";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function registerDriverAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const pin = formData.get("pin") as string;
  const confirmPin = formData.get("confirmPin") as string;

  // 1. Validation stricte
  if (!name || name.trim().length < 2) {
    return { error: "Veuillez renseigner un nom ou un pseudo valide." };
  }
  if (!phone || phone.replace(/\s/g, "").length < 8) {
    return { error: "Numéro de téléphone invalide." };
  }
  if (!pin || pin.length < 4 || !/^\d+$/.test(pin)) {
    return { error: "Le code PIN doit contenir au moins 4 chiffres." };
  }
  if (pin !== confirmPin) {
    return { error: "Les codes PIN ne correspondent pas." };
  }

  try {
    const cleanPhone = phone.replace(/\s/g, "");
    
    // 2. Vérification de l'unicité
    const existingUser = await prisma.user.findFirst({
      where: { phone: cleanPhone }
    });

    if (existingUser) {
      return { error: "Ce numéro de téléphone est déjà lié à un compte." };
    }

    const pinHash = crypto.createHash("sha256").update(pin).digest("hex");

    // 3. Transaction Atomique : Tenant Indépendant + User Livreur + SocialWallet
    await prisma.$transaction(async (tx) => {
      // Le livreur a son propre "Tenant" pour respecter le schéma relationnel
      const tenant = await tx.tenant.create({
        data: {
          name: `Flotte Indépendante - ${name.trim()}`,
          isPro: false,
        }
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: name.trim(),
          phone: cleanPhone,
          pinCode: pinHash,
          role: "DRIVER",
        }
      });

      // Initialisation vitale du portefeuille pour la gestion des cautions
      await tx.socialWallet.create({
        data: {
          userId: user.id,
          balance: 0,
        }
      });
    });

  } catch {
    return { error: "Une erreur est survenue lors de la création de votre compte." };
  }

  // 4. Redirection vers le portail de connexion
  redirect("/login?registered=true");
}
