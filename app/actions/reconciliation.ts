"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getSoftLockState } from "@/lib/soft-lock";

const logicalTs = () => Math.floor(Date.now() / 1000);

export async function reconcileCashAction(prevState: unknown, formData: FormData) {
  const session = await getSession();
  
  if (!session || (session.role !== "OWNER" && session.role !== "DISPATCHER")) {
    return { error: "Action non autorisée." };
  }

  const softLockState = await getSoftLockState(session.tenantId);
  if (softLockState.status === "LOCKED") {
    return { error: "Accès restreint. Veuillez souscrire à l'abonnement Pro pour débloquer la réconciliation." };
  }

  const driverId = formData.get("driverId") as string;

  if (!driverId) {
    return { error: "Identifiant du livreur manquant." };
  }

  try {
    // 1. Récupération ciblée des colis concernés (allégée : plus besoin d'include les events)
    const ordersToReconcile = await prisma.order.findMany({
      where: {
        tenantId: session.tenantId,
        driverId: driverId,
        cashStatus: "HELD_BY_DRIVER",
      },
      select: { id: true, packageStatus: true }
    });

    if (ordersToReconcile.length === 0) {
      return { error: "Aucun fond à réconcilier pour ce livreur." };
    }

    // 2. Préparation des événements d'audit avec un timestamp Unix synchronisé
    const timestamp = logicalTs();
    const newEvents = ordersToReconcile.map((order) => ({
      tenantId: session.tenantId,
      orderId: order.id,
      authorId: session.userId,
      fromStatus: order.packageStatus,
      toStatus: order.packageStatus,
      logicalTs: timestamp,
      reason: "Réconciliation financière validée avec le vendeur",
    }));

    // 3. Transaction atomique stricte
    await prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: {
          tenantId: session.tenantId,
          driverId: driverId,
          cashStatus: "HELD_BY_DRIVER",
        },
        data: {
          cashStatus: "RECONCILED_WITH_SELLER",
        },
      });

      await tx.packageEvent.createMany({
        data: newEvents,
      });
    });

  } catch {
    return { error: "Erreur lors de la réconciliation. Veuillez réessayer." };
  }

  revalidatePath("/b2b");
  revalidatePath("/b2b/reconciliation");
  
  return { success: true };
}
