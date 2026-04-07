"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import prismaAdmin from "@/lib/prisma-admin";
import { getSession } from "@/lib/session";
// 🚨 NOUVEL IMPORT : Le système Web Push
import { sendPushToUser } from "@/lib/push-sender";

// ── UTILITAIRES INTERNES ───────────────────────────────────

async function checkSmartCashLimit(driverId: string) {
  const driver = await prismaAdmin.user.findUnique({
    where: { id: driverId },
    select: { maxCashLimit: true }
  });

  if (!driver) return { error: "Livreur introuvable." };

  const cashResult = await prismaAdmin.order.aggregate({
    where: { driverId, cashStatus: "HELD_BY_DRIVER" },
    _sum: { amountDue: true },
  });

  const currentCash = cashResult._sum.amountDue || 0;

  if (currentCash >= driver.maxCashLimit) {
    return { 
      error: `Plafond de sécurité atteint (${currentCash} / ${driver.maxCashLimit} FCFA). Veuillez reverser vos encaissements actuels.` 
    };
  }

  return { currentCash };
}

// ── ASSIGNATION DEPUIS LE RADAR PUBLIC ─────────────────

export async function claimPublicOrderAction(orderId: string) {
  const session = await getSession();
  if (!session || !session.userId || session.role !== "DRIVER") {
    return { error: "Accès non autorisé. Vous devez être connecté en tant que livreur." };
  }

  const { error: limitError } = await checkSmartCashLimit(session.userId);
  if (limitError) return { error: limitError };

  try {
    await prismaAdmin.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: { id: true, tenantId: true, packageStatus: true, driverId: true }
      });

      if (!order || order.packageStatus !== "AVAILABLE_PUBLIC" || order.driverId !== null) {
        throw new Error("Course indisponible ou déjà assignée.");
      }

      await tx.order.update({
        where: { id: orderId },
        data: { driverId: session.userId, packageStatus: "DISPATCHED" },
      });

      await tx.packageEvent.create({
        data: {
          tenantId: order.tenantId, 
          orderId: order.id,
          authorId: session.userId,
          fromStatus: "AVAILABLE_PUBLIC",
          toStatus: "DISPATCHED",
          logicalTs: Math.floor(Date.now() / 1000),
          reason: "Opportunité remportée sur la Bourse Globale",
        },
      });
    });

    // 🚨 DÉCLENCHEUR PUSH (Auto-notification pour confirmer au livreur)
    await sendPushToUser(session.userId, {
      title: "✅ Course remportée !",
      body: "La course est à vous. Dirigez-vous vers la boutique pour la récupération.",
      url: `/pwa/packages/${orderId}`
    });

    revalidatePath("/pwa");
    revalidatePath("/pwa/opportunities"); 
    return { success: true };

  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "Erreur inattendue." };
  }
}

// ── INVITATIONS PRIVÉES ──────────────────────────────────────

export async function acceptDeliveryAction(orderId: string) {
  const session = await getSession();
  if (!session || !session.userId || session.role !== "DRIVER") {
    return { error: "Accès non autorisé. Vous devez être connecté en tant que livreur." };
  }

  const { error: limitError } = await checkSmartCashLimit(session.userId);
  if (limitError) return { error: limitError };

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId, driverId: session.userId, tenantId: session.tenantId },
        select: { id: true, packageStatus: true }
      });

      if (!order || order.packageStatus !== "DISPATCHED") {
        throw new Error("Ce colis n'est plus disponible pour acceptation.");
      }

      await tx.order.update({
        where: { id: orderId },
        data: { packageStatus: "IN_TRANSIT" }
      });

      await tx.packageEvent.create({
        data: {
          tenantId: session.tenantId,
          orderId,
          authorId: session.userId,
          fromStatus: "DISPATCHED",
          toStatus: "IN_TRANSIT",
          logicalTs: Math.floor(Date.now() / 1000),
          reason: "Invitation privée acceptée",
        }
      });
    });

    // 🚨 DÉCLENCHEUR PUSH
    await sendPushToUser(session.userId, {
      title: "🤝 Invitation acceptée",
      body: "Le colis est maintenant en transit vers le client.",
      url: `/pwa/packages/${orderId}`
    });

    revalidatePath("/pwa");
    return { success: true };
  } catch {
    return { error: "Erreur lors de l'acceptation." };
  }
}

export async function declineDeliveryAction(orderId: string) {
  const session = await getSession();
  if (!session || !session.userId || session.role !== "DRIVER") {
    return { error: "Accès non autorisé." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId, driverId: session.userId, tenantId: session.tenantId },
        select: { id: true, packageStatus: true }
      });

      if (!order || order.packageStatus !== "DISPATCHED") {
        throw new Error("Action impossible.");
      }

      await tx.order.update({
        where: { id: orderId },
        data: { packageStatus: "PENDING", driverId: null }
      });

      await tx.packageEvent.create({
        data: {
          tenantId: session.tenantId,
          orderId,
          authorId: session.userId,
          fromStatus: "DISPATCHED",
          toStatus: "PENDING",
          logicalTs: Math.floor(Date.now() / 1000),
          reason: "Invitation privée refusée",
        }
      });
    });

    revalidatePath("/pwa");
    return { success: true };
  } catch {
    return { error: "Erreur lors du refus." };
  }
}

// ── VALIDATION & LOGISTIQUE ──────────────────────────────────

export async function verifyDeliveryAction(orderId: string, providedPin: string) {
  const session = await getSession();
  if (!session || !session.userId || session.role !== "DRIVER") {
    return { error: "Accès non autorisé." };
  }

  try {
    return await prismaAdmin.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ 
        where: { id: orderId },
        select: { 
          id: true, 
          driverId: true, 
          packageStatus: true, 
          cashStatus: true,
          securityPin: true, 
          tenantId: true,
          isPublic: true,
          depositAmount: true, 
          socialContribution: true 
        }
      });

      if (!order || order.driverId !== session.userId) throw new Error("Colis introuvable.");
      
      // 🚨 CORRECTION : Les doublons inutiles ont été purgés ici (Idempotence Clean Code)
      if (["DELIVERED_VERIFIED", "DELIVERED_UNSECURED"].includes(order.packageStatus)) {
        return { success: true };
      }

      if (order.packageStatus !== "IN_TRANSIT") throw new Error("Statut de livraison invalide.");
      if (order.cashStatus !== "UNCOLLECTED") throw new Error("Incohérence du statut financier.");
      
      const expectedPin = order.securityPin || "0000";
      if (providedPin !== expectedPin) throw new Error("Code de sécurité incorrect.");

      await tx.order.update({ 
        where: { id: orderId },
        data: { packageStatus: "DELIVERED_VERIFIED", cashStatus: "HELD_BY_DRIVER" },
      });

      await tx.packageEvent.create({
        data: {
          tenantId: order.tenantId, 
          orderId: order.id,
          authorId: session.userId,
          fromStatus: order.packageStatus,
          toStatus: "DELIVERED_VERIFIED",
          logicalTs: Math.floor(Date.now() / 1000),
          reason: "Livraison validée par code PIN",
        },
      });

      // ── GESTION FINANCIÈRE ──
      const wallet = await tx.socialWallet.findUnique({ where: { userId: session.userId } });
      
      if (wallet) {
        if (order.isPublic && order.depositAmount > 0) {
          await tx.socialTransaction.create({
            data: { 
              walletId: wallet.id, 
              orderId: order.id, 
              amount: order.depositAmount, 
              type: "CONTRIBUTION" 
            }
          });
          await tx.socialWallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: order.depositAmount } }
          });
        }

        const socialContribution = order.socialContribution || 100;
        
        await tx.socialTransaction.create({
          data: { 
            walletId: wallet.id, 
            orderId: order.id, 
            amount: -socialContribution, 
            type: "CONTRIBUTION" 
          }
        });
        
        await tx.socialWallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: socialContribution } }
        });
      }

      return { success: true };
    });
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "Erreur lors de la validation." };
  } finally {
    revalidatePath("/pwa");
    revalidatePath("/pwa/wallet");
  }
}

export async function reportIncidentAction(prevState: unknown, formData: FormData) {
  const session = await getSession();
  
  if (!session || !session.userId || session.role !== "DRIVER") {
    return { error: "Non autorisé. Seul un livreur peut signaler un litige." };
  }

  const orderId = formData.get("orderId") as string;
  const reason = formData.get("reason") as string;
  const comment = formData.get("comment") as string;
  const latStr = formData.get("latitude") as string;
  const lngStr = formData.get("longitude") as string;

  if (!orderId || !reason || !comment) {
    return { error: "Veuillez remplir tous les champs obligatoires." };
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  const latitude = isNaN(lat) ? null : lat;
  const longitude = isNaN(lng) ? null : lng;

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ 
        where: { id: orderId },
        select: { id: true, driverId: true, customerPhone: true, tenantId: true, packageStatus: true }
      });

      if (!order || order.driverId !== session.userId) throw new Error("Colis introuvable.");
      if (order.packageStatus === "DELIVERED_VERIFIED") throw new Error("Impossible de signaler un colis déjà livré.");
      if (order.packageStatus === "CONFLICT") throw new Error("Ce colis est déjà en litige.");

      await tx.dispute.create({
        data: {
          orderId,
          driverId: session.userId,
          reason,
          driverComment: comment,
          latitude,
          longitude,
        }
      });

      await tx.order.update({
        where: { id: orderId },
        data: { packageStatus: "CONFLICT" }
      });

      const lastEvent = await tx.packageEvent.findFirst({
        where: { orderId: order.id },
        orderBy: { logicalTs: "desc" },
      });
      const nextTs = lastEvent ? lastEvent.logicalTs + 1 : 1;

      const gpsNote = latitude && longitude 
        ? "📍 Preuve GPS enregistrée sur place." 
        : "⚠️ Aucune preuve GPS fournie.";

      await tx.packageEvent.create({
        data: {
          orderId: order.id,
          tenantId: order.tenantId,
          authorId: session.userId,
          toStatus: "CONFLICT",
          logicalTs: nextTs,
          latitude,
          longitude,
          reason: `Signalement: ${reason} - ${comment} | ${gpsNote}`,
        }
      });

      if (reason === "CLIENT_LIAR" || reason === "REFUSAL_TO_PAY" || reason.includes("absent") || reason.includes("injoignable")) {
        const risk = await tx.customerRisk.upsert({
          where: { customerPhone: order.customerPhone },
          create: { customerPhone: order.customerPhone, reportCount: 1 },
          update: { reportCount: { increment: 1 }, lastIncidentAt: new Date() }
        });

        await tx.incidentLog.create({
          data: {
            riskProfileId: risk.id,
            tenantId: order.tenantId,
            reason: `Litige commande ${orderId}: ${reason}`,
          }
        });
      }
    });

    revalidatePath(`/pwa/packages/${orderId}`);
    return { success: true };

  } catch (error: unknown) {
    console.error("🔥 Erreur reportIncidentAction :", error);
    return { error: error instanceof Error ? error.message : "Une erreur est survenue lors de l'enregistrement du litige." };
  }
}
