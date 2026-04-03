"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { PackageStatus } from "@prisma/client";
import { getDistance } from "@/lib/geo";

export async function updateStatusWithGpsAction(
  orderId: string,
  newStatus: PackageStatus,
  latitude: number | null,
  longitude: number | null,
  clientReason?: string
) {
  const session = await getSession();
  
  if (!session || session.role !== "DRIVER") {
    return { error: "Non autorisé. Seul un livreur peut mettre à jour ce statut." };
  }

  try {
    // 1. Récupération des données du colis, incluant les coordonnées de retrait prévues
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { 
        id: true, 
        tenantId: true,
        pickupLat: true,
        pickupLng: true
      }
    });

    if (!order) return { error: "Colis introuvable." };

    let finalReason = clientReason || "";

    // 2. LOGIQUE DE GÉOFENCING (10 mètres)
    // S'il s'agit du passage en IN_TRANSIT (Le livreur dit "J'ai récupéré le colis")
    if (newStatus === "IN_TRANSIT") {
      if (latitude && longitude && order.pickupLat && order.pickupLng) {
        const distance = getDistance(latitude, longitude, order.pickupLat, order.pickupLng);
        
        const noteText = distance <= 10 
          ? "✅ POSITION VÉRIFIÉE : Retrait confirmé sur place."
          : `⚠️ ALERTE ÉCART : Le livreur a validé à ${Math.round(distance)}m du point prévu.`;
          
        finalReason = finalReason ? `${noteText} | Motif: ${finalReason}` : noteText;
      } else {
        finalReason = finalReason ? `ℹ️ GPS non vérifiable | Motif: ${finalReason}` : "ℹ️ Position GPS de retrait non vérifiable.";
      }
    }

    // 3. TRANSACTION ATOMIQUE PRISMA
    await prisma.$transaction(async (tx) => {
      const lastEvent = await tx.packageEvent.findFirst({
        where: { orderId: order.id },
        orderBy: { logicalTs: "desc" },
      });
      const nextTs = lastEvent ? lastEvent.logicalTs + 1 : 1;

      await tx.order.update({
        where: { id: order.id },
        data: { packageStatus: newStatus }, 
      });

      await tx.packageEvent.create({
        data: {
          orderId: order.id,
          tenantId: order.tenantId,
          authorId: session.userId,
          toStatus: newStatus, 
          logicalTs: nextTs,
          latitude,
          longitude,
          reason: finalReason || null, // Injection de la note de géofencing
        },
      });
    });

    revalidatePath(`/pwa/orders/${orderId}`);
    revalidatePath(`/pwa/packages/${orderId}`);
    revalidatePath(`/b2b/orders/${orderId}`);
    
    return { success: true };
  } catch (error) {
    console.error("🔥 Erreur updateStatusWithGpsAction :", error);
    return { error: "Erreur lors de l'enregistrement du statut." };
  }
}
