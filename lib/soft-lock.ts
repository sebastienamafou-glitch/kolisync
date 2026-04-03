import prisma from "@/lib/prisma";

export type SoftLockState = 
  | { status: "PRO" }
  | { status: "ACTIVE"; quotaUsed: number; quotaMax: number }
  | { status: "WARNING"; daysLeft: number; lockedAmount: number; quotaUsed: number; quotaMax: number }
  | { status: "LOCKED"; lockedAmount: number; quotaUsed: number; quotaMax: number };

export async function getSoftLockState(tenantId: string): Promise<SoftLockState> {
  const QUOTA_MAX = 30;
  const now = new Date();

  // 1. Vérification de l'abonnement PRO en base de données
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { isPro: true, subscriptionEndsAt: true }
  });

  // Si l'entreprise est PRO et que l'abonnement n'est pas expiré
  if (tenant?.isPro && tenant.subscriptionEndsAt && tenant.subscriptionEndsAt > now) {
    return { status: "PRO" };
  }

  // 2. Si pas d'abonnement actif, on applique la logique de Soft-Lock (Freemium)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlyOrders = await prisma.order.findMany({
    where: { 
      tenantId, // Filtré par sécurité bien que le middleware Prisma le fasse déjà
      createdAt: { gte: startOfMonth } 
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, createdAt: true, cashStatus: true, amountDue: true }
  });

  const quotaUsed = monthlyOrders.length;

  if (quotaUsed <= QUOTA_MAX) {
    return { status: "ACTIVE", quotaUsed, quotaMax: QUOTA_MAX };
  }

  // 3. Calcul du J+0 (La date exacte du 31ème colis)
  const overflowOrder = monthlyOrders[QUOTA_MAX]; 
  const jZeroDate = new Date(overflowOrder.createdAt);
  
  const diffTime = Math.abs(now.getTime() - jZeroDate.getTime());
  const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(7 - daysElapsed, 0);

  // 4. Calcul de l'argent pris en "otage" (Cash à réconcilier)
  const lockedAmount = monthlyOrders
    .filter(o => o.cashStatus === "HELD_BY_DRIVER")
    .reduce((sum, order) => sum + order.amountDue, 0);

  // 5. Verdict
  if (daysElapsed >= 7) {
    return { status: "LOCKED", lockedAmount, quotaUsed, quotaMax: QUOTA_MAX };
  }

  return { status: "WARNING", daysLeft, lockedAmount, quotaUsed, quotaMax: QUOTA_MAX };
}
