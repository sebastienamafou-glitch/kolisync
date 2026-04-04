import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import KycFormClient from "./KycFormClient";

export default async function KycUploadPage() {
  const session = await getSession();
  
  if (!session || session.role !== "DRIVER") {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { kycStatus: true, kycRejectionReason: true }
  });

  if (!user) {
    redirect("/");
  }

  // 🚨 Si le livreur est déjà validé, on lui bloque l'accès à l'upload
  if (user.kycStatus === "APPROVED") {
    redirect("/pwa");
  }

  return (
    <KycFormClient 
      kycStatus={user.kycStatus} 
      rejectionReason={user.kycRejectionReason} 
    />
  );
}
