"use server";

import prismaAdmin from "@/lib/prisma-admin";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function claimOpportunityAction(orderId: string) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== "DRIVER") {
      return { error: "Seuls les livreurs peuvent accepter des opportunités." };
    }

    return await prismaAdmin.$transaction(async (tx) => {
      const [order, wallet] = await Promise.all([
        tx.order.findUnique({ 
          where: { id: orderId },
          select: { id: true, isPublic: true, driverId: true, depositAmount: true, tenantId: true } 
        }),
        tx.socialWallet.findUnique({ where: { userId: session.userId } })
      ]);

      if (!order || !order.isPublic || order.driverId) {
        throw new Error("Cette opportunité n'est plus disponible."); 
      }

      const requiredDeposit = order.depositAmount || 0;
      const balance = wallet?.balance ?? 0;

      if (balance < requiredDeposit) {
        throw new Error(
          `Solde insuffisant (${balance} FCFA). Il vous faut au moins ${requiredDeposit} FCFA de caution pour ce colis.`
        );
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          driverId: session.userId,
          isPublic: false,
          packageStatus: "IN_TRANSIT", 
        },
      });

      await tx.packageEvent.create({
        data: {
          orderId: order.id,
          tenantId: order.tenantId,
          authorId: session.userId,
          fromStatus: "AVAILABLE_PUBLIC",
          toStatus: "IN_TRANSIT",
          logicalTs: Math.floor(Date.now() / 1000),
          reason: "Opportunité saisie via Bourse Globale",
        },
      });

      if (requiredDeposit > 0 && wallet) {
        await tx.socialTransaction.create({
          data: {
            walletId: wallet.id,
            orderId: order.id,
            amount: -requiredDeposit, 
            type: "ADJUSTMENT",
          },
        });

        await tx.socialWallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: requiredDeposit } }
        });
      }

      revalidatePath("/pwa");
      
      // 🚨 CORRECTION ICI : On déclare explicitement `error: undefined` pour satisfaire TypeScript
      return { success: true, orderId: updatedOrder.id, error: undefined };
    });
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Une erreur est survenue lors de l'assignation." };
  }
}
