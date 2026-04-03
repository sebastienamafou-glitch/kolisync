import prisma from "@/lib/prisma";
import OrderRadarCard from "./OrderRadarCard";

export default async function AvailableOrdersList() {
  // Le middleware Prisma filtre déjà automatiquement par tenantId.
  // Nous cherchons uniquement les commandes non assignées avec le statut DISPATCHED.
  const availableOrders = await prisma.order.findMany({
    where: {
      driverId: null,
      packageStatus: "DISPATCHED",
    },
    select: {
      id: true,
      customerName: true,
      commune: true,
      deliveryAddress: true,
      amountDue: true,
      deliveryFee: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc", // Les plus anciennes en premier (priorité)
    },
  });

  if (availableOrders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <p className="text-sm font-medium text-gray-500">
          Aucune nouvelle course disponible dans votre zone pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">
        Nouvelles opportunités ({availableOrders.length})
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {availableOrders.map((order) => (
          <OrderRadarCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
