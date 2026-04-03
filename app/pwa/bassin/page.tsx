import { redirect } from "next/navigation";
import { Navigation } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { BassinCoursesClient } from "@/features/marketplace/BassinCoursesClient";

export default async function BassinPage() {
  const session = await getSession();
  
  if (!session || session.role !== "DRIVER") {
    redirect("/");
  }

  // Récupération des données en parallèle 
  const [orders, user] = await Promise.all([
    prisma.order.findMany({
      where: {
        tenantId: session.tenantId,
        packageStatus: "AVAILABLE_PUBLIC", // Statut du bassin de courses
      },
      select: {
        id: true,
        customerName: true,
        deliveryAddress: true,
        commune: true,
        amountDue: true,
        deliveryFee: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { preferredCommune: true }
    })
  ]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24">
      <header className="mb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Navigation className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Bourse aux courses</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Disponibles pour mon organisation
            </p>
          </div>
        </div>
      </header>

      <BassinCoursesClient 
        initialOrders={orders} 
        preferredZone={user?.preferredCommune || null} 
      />
    </div>
  );
}
