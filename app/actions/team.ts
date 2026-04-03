"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function addDriverAction(prevState: unknown, formData: FormData) {
  const session = await getSession();
  
  // Sécurité RBAC : Seul le propriétaire ou le dispatcher peut recruter
  if (!session || (session.role !== "OWNER" && session.role !== "DISPATCHER")) {
    return { error: "Non autorisé à ajouter un membre." };
  }

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const pin = formData.get("pin") as string;

  if (!name || name.trim().length < 2) {
    return { error: "Le nom du livreur est requis (min 2 caractères)." };
  }
  if (!phone || phone.trim().length < 8) {
    return { error: "Un numéro de téléphone valide est requis." };
  }
  if (!pin || pin.trim().length < 4) {
    return { error: "Le code PIN doit contenir au moins 4 chiffres." };
  }

  try {
    // Vérification de l'unicité du numéro (contrainte Prisma)
    const existingUser = await prisma.user.findUnique({
      where: { phone: phone.trim() },
    });

    if (existingUser) {
      return { error: "Ce numéro de téléphone est déjà assigné à un compte." };
    }

    // Hachage cryptographique du PIN pour la sécurité de la base de données
    const hashedPin = await bcrypt.hash(pin.trim(), 10);

    await prisma.user.create({
      data: {
        tenantId: session.tenantId,
        name: name.trim(),
        phone: phone.trim(),
        pinCode: hashedPin,
        role: "DRIVER",
      },
    });

  } catch {
    return { error: "Une erreur critique est survenue lors de la création." };
  }

  // Purge le cache pour rafraîchir la liste instantanément
  revalidatePath("/b2b/settings");
  return { success: true, message: "Livreur ajouté avec succès à la flotte." };
}
