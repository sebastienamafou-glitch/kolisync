import prisma from "@/lib/prisma";

export async function getCurrentDriverCash(driverId: string) {
  // On additionne le montant (amountDue) de toutes les commandes
  // qui ont été livrées (DELIVERED_VERIFIED ou DELIVERED_UNSECURED)
  // et dont le cash est toujours dans les poches du livreur (HELD_BY_DRIVER)
  const result = await prisma.order.aggregate({
    where: {
      driverId: driverId,
      cashStatus: "HELD_BY_DRIVER",
    },
    _sum: {
      amountDue: true,
    },
  });

  return result._sum.amountDue || 0;
}
