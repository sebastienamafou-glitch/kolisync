"use server";

import { revalidatePath } from "next/cache";
import prismaAdmin from "@/lib/prisma-admin";
import { getSession } from "@/lib/session";
import { sendSMS } from "@/lib/sms";

export async function approveKycAction(userId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Non autorisé. Accès Admin requis." };
  }

  try {
    const updatedUser = await prismaAdmin.user.update({
      where: { id: userId },
      data: { 
        kycStatus: "APPROVED", 
        kycVerifiedAt: new Date(),
        kycRejectionReason: null
      }
    });

    // 📲 Déclenchement de la notification d'activation
    await sendSMS(
      updatedUser.phone,
      "KoliSync: Félicitations ! Votre profil est activé. Vous pouvez dès maintenant accepter vos premières courses."
    );

    revalidatePath("/admin");
    revalidatePath("/admin/kyc");
    return { success: true };
  } catch (error: unknown) {
    console.error("Erreur KYC Approve :", error);
    return { error: "Une erreur est survenue lors de l'approbation." };
  }
}

export async function rejectKycAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Non autorisé. Accès Admin requis." };
  }

  const userId = formData.get("userId") as string;
  const reason = formData.get("reason") as string;

  if (!userId || !reason) {
    return { error: "Veuillez fournir une raison de rejet." };
  }

  try {
    const updatedUser = await prismaAdmin.user.update({
      where: { id: userId },
      data: { 
        kycStatus: "REJECTED", 
        kycRejectionReason: reason 
      }
    });

    // 📲 Déclenchement de la notification de refus
    await sendSMS(
      updatedUser.phone,
      `KoliSync: Votre dossier a été refusé. Motif: ${reason}. Veuillez mettre à jour vos documents sur l'application.`
    );

    revalidatePath("/admin");
    revalidatePath("/admin/kyc");
    return { success: true };
  } catch (error: unknown) {
    console.error("Erreur KYC Reject :", error);
    return { error: "Une erreur est survenue lors du rejet." };
  }
}
