"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcrypt"; // 🚨 CORRECTION : Utilisation de bcrypt au lieu de crypto
import prisma from "@/lib/prisma";

export async function registerSellerAction(prevState: unknown, formData: FormData) {
  const shopName = formData.get("shopName") as string;
  const ownerName = formData.get("ownerName") as string;
  const phone = formData.get("phone") as string;
  const pin = formData.get("pin") as string;
  const confirmPin = formData.get("confirmPin") as string;

  // 1. Validation de base
  if (!shopName || shopName.trim().length < 2) {
    return { error: "Le nom de la boutique est trop court." };
  }
  if (!ownerName || ownerName.trim().length < 2) {
    return { error: "Veuillez renseigner un nom valide." };
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
    // 2. Vérification de l'unicité du téléphone
    const cleanPhone = phone.replace(/\s/g, "");
    const existingUser = await prisma.user.findFirst({
      where: { phone: cleanPhone }
    });

    if (existingUser) {
      return { error: "Ce numéro de téléphone est déjà utilisé." };
    }

    // 3. Hachage du PIN avec Bcrypt (10 salt rounds est le standard)
    const saltRounds = 10;
    const pinHash = await bcrypt.hash(pin, saltRounds);

    // 4. Transaction Atomique 
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: shopName.trim(),
          isPro: false, 
        }
      });

      await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: ownerName.trim(),
          phone: cleanPhone,
          pinCode: pinHash, // ✅ Le hachage est maintenant compatible avec le login
          role: "OWNER",
        }
      });
    });

  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    return { error: "Une erreur est survenue lors de la création du compte." };
  }

  // 5. Redirection
  redirect("/login?registered=true");
}
