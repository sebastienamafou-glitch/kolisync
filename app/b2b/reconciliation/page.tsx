import { redirect } from "next/navigation";
import Link from "next/link";
import { Banknote, User, Package, AlertTriangle, Lock, TrendingUp } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import ReconcileForm from "@/features/driver/ReconcileForm";
import { getSoftLockState } from "@/lib/soft-lock";

// ─── Typages et Helpers ───────────────────────────────────────────────────────

interface DriverGroup {
  driver: { id: string; name: string; phone: string };
  totalAmountDue: number;
  totalDeliveryFee: number;
  netAmount: number;
  ordersCount: number;
}

function formatFCFA(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

// ─── Page Principale (Server Component) ───────────────────────────────────────

export default async function ReconciliationPage() {
  const session = await getSession();
  if (!session) redirect("/");

  // 1. Vérification du Soft-Lock
  const softLockState = await getSoftLockState(session.tenantId);

  // PAYWALL : Verrouillage strict
  if (softLockState.status === "LOCKED") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-500 ring-4 ring-red-500/10">
          <Lock className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Accès restreint</h1>
        <p className="mt-3 max-w-md text-base text-slate-500">
          Votre période de gratuité est expirée. Vous avez <strong className="text-slate-900">{formatFCFA(softLockState.lockedAmount)}</strong> en attente de réconciliation.
        </p>
        <Link 
          href="/b2b/upgrade" 
          className="mt-8 flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-bold text-white shadow-lg transition-transform active:scale-95 hover:bg-slate-800"
        >
          <TrendingUp className="h-5 w-5" />
          Débloquer mon espace
        </Link>
      </div>
    );
  }

  // 2. Récupération des commandes non réconciliées
  const pendingOrders = await prisma.order.findMany({
    where: {
      tenantId: session.tenantId,
      cashStatus: "HELD_BY_DRIVER",
    },
    include: {
      driver: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // 3. Regroupement par Livreur
  const driversMap = new Map<string, DriverGroup>();
  let globalTotalDue = 0;
  let globalTotalFee = 0;
  let globalNetAmount = 0;

  for (const order of pendingOrders) {
    const fee = order.deliveryFee || 0;
    const net = order.amountDue - fee;

    globalTotalDue += order.amountDue;
    globalTotalFee += fee;
    globalNetAmount += net;
    
    const driverId = order.driverId || "unassigned";
    const driverData = order.driver || { id: "unassigned", name: "Livreur inconnu", phone: "N/A" };

    if (!driversMap.has(driverId)) {
      driversMap.set(driverId, {
        driver: driverData,
        totalAmountDue: 0,
        totalDeliveryFee: 0,
        netAmount: 0,
        ordersCount: 0,
      });
    }

    const group = driversMap.get(driverId)!;
    group.totalAmountDue += order.amountDue;
    group.totalDeliveryFee += fee;
    group.netAmount += net;
    group.ordersCount += 1;
  }

  const groupedDrivers = Array.from(driversMap.values());

  // 4. LE JSX FINAL (Le fameux "return" manquant est bien là)
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* ── En-tête Global ── */}
      <div className="overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Réconciliation</h1>
            <p className="mt-2 text-sm font-medium text-slate-400">
              Cash physiquement détenu par vos livreurs sur le terrain.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 text-right backdrop-blur-md ring-1 ring-white/20">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Net à encaisser</p>
            <p className="mt-1 text-4xl font-black tracking-tight text-white">{formatFCFA(Math.max(0, globalNetAmount))}</p>
            <div className="mt-3 flex items-center justify-end gap-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 border-t border-white/10 pt-3">
              <span>Collecté: <strong className="text-white">{formatFCFA(globalTotalDue)}</strong></span>
              <span>-</span>
              <span>Frais: <strong className="text-white">{formatFCFA(globalTotalFee)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Liste par Livreur ── */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 pl-2">
          Détail par Livreur
        </h2>

        {groupedDrivers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-16 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <Banknote className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Tout est en règle</h3>
            <p className="mt-1 text-sm text-slate-500">
              Il n'y a aucun fond en attente de réconciliation.
            </p>
          </div>
        ) : (
          groupedDrivers.map((group) => (
            <div key={group.driver.id} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md">
              <div className="p-6 sm:flex sm:items-center sm:justify-between">
                
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <User className="h-6 w-6 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{group.driver.name}</h3>
                    <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        {group.ordersCount} colis
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>{group.driver.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-0 sm:flex sm:items-center sm:gap-6">
                  
                  {/* Détail du calcul pour le vendeur */}
                  <div className="mb-4 sm:mb-0 sm:pr-6 sm:border-r sm:border-slate-100">
                    <div className="flex justify-between sm:justify-end gap-4 text-xs font-medium text-slate-500 mb-1">
                      <span>Total collecté :</span>
                      <span className="text-slate-900">{formatFCFA(group.totalAmountDue)}</span>
                    </div>
                    <div className="flex justify-between sm:justify-end gap-4 text-xs font-medium text-slate-500 mb-2">
                      <span>Rémunération livreur :</span>
                      <span className="text-slate-900">- {formatFCFA(group.totalDeliveryFee)}</span>
                    </div>
                    <div className="flex justify-between sm:justify-end gap-4 text-sm font-black text-amber-500 border-t border-slate-100 pt-2">
                      <span className="uppercase tracking-widest text-[10px] self-end mb-0.5">Net à reverser</span>
                      <span className="text-xl">{formatFCFA(Math.max(0, group.netAmount))}</span>
                    </div>
                  </div>
                  
                  {group.driver.id === "unassigned" ? (
                    <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 sm:mt-0 w-full sm:w-auto">
                      <AlertTriangle className="h-5 w-5" />
                      Assignation requise
                    </div>
                  ) : (
                    <ReconcileForm 
                      driverId={group.driver.id} 
                      amountFormatted={formatFCFA(Math.max(0, group.netAmount))} 
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
