"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { OfflineSyncEvent } from "@/lib/offline-store";
import { PackageStatus } from "@prisma/client";

export async function processOfflineQueueAction(events: OfflineSyncEvent[]) {
  const session = await getSession();
  if (!session || session.role !== "DRIVER") {
    return { error: "Non autorisé", processedIds: [] };
  }

  const processedIds: string[] = [];

  for (const event of events) {
    try {
      // 1. Récupération de l'état actuel (Server State)
      const order = await prisma.order.findUnique({
        where: { id: event.orderId, tenantId: session.tenantId },
        include: { events: { orderBy: { logicalTs: "desc" }, take: 1 } },
      });

      if (!order) {
        processedIds.push(event.id); // On purge pour ne pas bloquer la queue
        continue;
      }

      const serverLogicalTs = order.events.length > 0 ? order.events[0].logicalTs : 0;
      const clientLogicalTs = event.logicalTs;

      // 2. Règle CRDT : Le serveur a avancé pendant que le client était hors-ligne (Conflit !)
      if (serverLogicalTs > clientLogicalTs) {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { packageStatus: "CONFLICT" },
          });
          await tx.packageEvent.create({
            data: {
              tenantId: session.tenantId,
              orderId: order.id,
              authorId: session.userId,
              fromStatus: order.packageStatus,
              toStatus: "CONFLICT",
              logicalTs: serverLogicalTs + 1,
            },
          });
        });
        processedIds.push(event.id);
        continue; // On passe à l'événement suivant
      }

      // 3. Application de la mutation si pas de conflit
      let newStatus: PackageStatus = order.packageStatus;
      let latitude = order.latitude;
      let longitude = order.longitude;

      if (event.actionType === "DELIVERY_PIN") {
        const pin = event.payload as string;
        const expectedPin = order.securityPin || "0000";
        if (pin === expectedPin) newStatus = "DELIVERED_VERIFIED";
      } else if (event.actionType === "DELIVERY_GPS") {
        const coords = event.payload as { lat: number; lng: number };
        latitude = coords.lat;
        longitude = coords.lng;
        newStatus = "DELIVERED_UNSECURED";
      }

      // Si l'état change, on l'applique en transaction
      if (newStatus !== order.packageStatus) {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: {
              packageStatus: newStatus,
              cashStatus: "HELD_BY_DRIVER",
              latitude,
              longitude,
            },
          });
          await tx.packageEvent.create({
            data: {
              tenantId: session.tenantId,
              orderId: order.id,
              authorId: session.userId,
              fromStatus: order.packageStatus,
              toStatus: newStatus,
              logicalTs: clientLogicalTs + 1, // Le client impose son TS
              latitude,
              longitude,
            },
          });
        });
      }
      processedIds.push(event.id);
    } catch {
      // En cas d'erreur DB, on ne met pas l'ID dans processedIds
      // L'événement restera dans IndexedDB et sera re-tenté à la prochaine synchro
      console.error(`Échec CRDT pour l'événement ${event.id}`);
    }
  }

  return { success: true, processedIds };
}
