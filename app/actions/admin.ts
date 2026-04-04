"use server";

import { revalidatePath } from "next/cache";
import prismaAdmin from "@/lib/prisma-admin";
import { getSession } from "@/lib/session";

// ── UTILITAIRE DE SÉCURITÉ (God Mode Only) ──
async function verifyAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Accès refusé. Réservé au QG KoliSync.");
  }
  return session;
}

// ── 1. MODULE BOUTIQUES : Activer/Désactiver l'abonnement PRO ──
export async function toggleTenantProAction(tenantId: string, currentStatus: boolean) {
  await verifyAdmin();

  try {
    await prismaAdmin.tenant.update({
      where: { id: tenantId },
      data: { isPro: !currentStatus },
    });
    
    revalidatePath("/admin/tenants");
    return { success: true };
  } catch (error: unknown) {
    return { error: "Erreur lors de la modification du statut Pro." };
  }
}

// ── 2. MODULE LIVREURS : Ajuster le plafond de confiance ──
export async function updateDriverCashLimitAction(formData: FormData) {
  await verifyAdmin();

  const driverId = formData.get("driverId") as string;
  const newLimit = parseFloat(formData.get("newLimit") as string);

  if (!driverId || isNaN(newLimit) || newLimit < 0) {
    return { error: "Montant invalide." };
  }

  try {
    await prismaAdmin.user.update({
      where: { id: driverId },
      data: { maxCashLimit: newLimit },
    });
    
    revalidatePath("/admin/drivers");
    return { success: true };
  } catch (error: unknown) {
    return { error: "Erreur lors de la mise à jour du plafond." };
  }
}

// ── 3. MODULE LITIGES : Arbitrage (Forcer la validation ou Annuler) ──
export async function resolveDisputeAction(formData: FormData) {
  console.log("🚨 [HQ] Demande d'arbitrage reçue !"); 
  
  const session = await verifyAdmin();

  const disputeId = formData.get("disputeId") as string;
  const orderId = formData.get("orderId") as string;
  const decision = formData.get("decision") as "VALIDATE" | "CANCEL"; 

  console.log(`➡️  Décision: ${decision} | Commande: ${orderId}`);

  try {
    await prismaAdmin.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error("Commande introuvable.");

      const newStatus = decision === "VALIDATE" ? "DELIVERED_VERIFIED" : "FAILED_RETURNED";
      
      const updateData = decision === "VALIDATE" 
        ? { packageStatus: newStatus, cashStatus: "HELD_BY_DRIVER" as const }
        : { packageStatus: newStatus };
      
      await tx.order.update({
        where: { id: orderId },
        data: updateData,
      });

      await tx.packageEvent.create({
        data: {
          tenantId: order.tenantId,
          orderId: order.id,
          authorId: session.userId,
          fromStatus: "CONFLICT",
          toStatus: newStatus,
          logicalTs: Math.floor(Date.now() / 1000),
          reason: decision === "VALIDATE" 
            ? "Litige arbitré : Livraison validée par KoliSync HQ" 
            : "Litige arbitré : Colis annulé par KoliSync HQ",
        },
      });

      await tx.dispute.delete({ where: { id: disputeId } });
    });

    console.log("✅ [HQ] Arbitrage appliqué avec succès !");
    
    revalidatePath("/admin/disputes");
    revalidatePath("/admin"); 
    return { success: true };
    
  } catch (error: unknown) {
    console.error("❌ [HQ] Erreur fatale lors de l'arbitrage :", error); 
    return { error: "Erreur lors de l'arbitrage du litige." };
  }
}
