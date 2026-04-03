"use server";

import { revalidatePath } from "next/cache";
import prismaAdmin from "@/lib/prisma-admin";
import { getSession } from "@/lib/session";

export async function approveKycAction(userId: string) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") {
    return { error: "Non autorisé. Accès SuperAdmin requis." };
  }

  try {
    await prismaAdmin.user.update({
      where: { id: userId },
      data: { 
        kycStatus: "APPROVED", 
        kycVerifiedAt: new Date(),
        kycRejectionReason: null
      }
    });

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
  if (!session || session.role !== "SUPERADMIN") {
    return { error: "Non autorisé. Accès SuperAdmin requis." };
  }

  const userId = formData.get("userId") as string;
  const reason = formData.get("reason") as string;

  if (!userId || !reason) {
    return { error: "Veuillez fournir une raison de rejet." };
  }

  try {
    await prismaAdmin.user.update({
      where: { id: userId },
      data: { 
        kycStatus: "REJECTED", 
        kycRejectionReason: reason 
      }
    });

    revalidatePath("/admin");
    revalidatePath("/admin/kyc");
    return { success: true };
  } catch (error: unknown) {
    console.error("Erreur KYC Reject :", error);
    return { error: "Une erreur est survenue lors du rejet." };
  }
}
