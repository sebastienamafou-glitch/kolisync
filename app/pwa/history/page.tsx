import { redirect } from "next/navigation";
import { CheckCircle2, AlertTriangle, XCircle, MapPin, Clock, History as HistoryIcon } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { PackageStatus } from "@prisma/client";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFCFA(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const STATUS_UI: Record<
  PackageStatus,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  PENDING:             { icon: Clock,         color: "text-slate-500",   bg: "bg-slate-100",   label: "En attente" },
  IN_TRANSIT:          { icon: Clock,         color: "text-amber-500",   bg: "bg-amber-100",   label: "En cours" },
  DELIVERED_VERIFIED:  { icon: CheckCircle2,  color: "text-emerald-500", bg: "bg-emerald-100", label: "Livré ✓" },
  DELIVERED_UNSECURED: { icon: MapPin,        color: "text-orange-500",  bg: "bg-orange-100",  label: "GPS" },
  FAILED_RETURNED:     { icon: XCircle,       color: "text-red-500",     bg: "bg-red-100",     label: "Échoué" },
  CONFLICT:            { icon: AlertTriangle, color: "text-purple-500",  bg: "bg-purple-100",  label: "Conflit" },
};

// ─── Server Component ─────────────────────────────────────────────────────────

export default async function PWAHistoryPage() {
  const session = await getSession();
  if (!session || session.role !== "DRIVER") redirect("/");

  // Récupération des colis terminés (Livrés, Échoués ou en Conflit)
  const pastOrders = await prisma.order.findMany({
    where: {
      tenantId: session.tenantId,
      packageStatus: {
        in: ["DELIVERED_VERIFIED", "DELIVERED_UNSECURED", "FAILED_RETURNED", "CONFLICT"],
      },
      // Note d'architecture : Dans une version avancée, on filtrerait aussi par driverId: session.userId.
      // Pour ce MVP, on affiche l'historique de la flotte pour le test.
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  // Calcul rapide du cash collecté aujourd'hui (uniquement les succès)
  const totalCollected = pastOrders
    .filter((o) => o.packageStatus === "DELIVERED_VERIFIED" || o.packageStatus === "DELIVERED_UNSECURED")
    .reduce((sum, order) => sum + order.amountDue, 0);

  return (
    <div className="p-4 space-y-6 pb-8">
      
      {/* ── En-tête ── */}
      <header className="pt-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Historique</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Vos courses terminées et vos encaissements.
        </p>
      </header>

      {/* ── Carte de Synthèse (Cash Collecté) ── */}
      <div className="overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/20">
        <div className="mb-2 flex items-center gap-2 text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-xs font-black uppercase tracking-widest">Cash sécurisé</span>
        </div>
        <p className="text-4xl font-black tracking-tight">{formatFCFA(totalCollected)}</p>
      </div>

      {/* ── Liste des courses passées ── */}
      <div className="space-y-4">
        {pastOrders.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
              <HistoryIcon className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-900">Aucun historique</h3>
            <p className="mt-1 text-sm text-slate-500">
              Vous n&apos;avez pas encore terminé de livraison aujourd&apos;hui.
            </p>
          </div>
        ) : (
          pastOrders.map((order) => {
            const StatusIcon = STATUS_UI[order.packageStatus].icon;
            const statusColor = STATUS_UI[order.packageStatus].color;
            const statusBg = STATUS_UI[order.packageStatus].bg;
            const statusLabel = STATUS_UI[order.packageStatus].label;

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition-all"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-bold text-slate-900 leading-tight">
                        {order.customerName}
                      </p>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">
                        {formatDate(order.updatedAt)} · ID: {order.id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                    
                    <span className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${statusBg} ${statusColor}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusLabel}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Montant
                    </span>
                    <span className={`text-lg font-black ${
                      order.packageStatus === "FAILED_RETURNED" ? "text-slate-400 line-through" : "text-slate-900"
                    }`}>
                      {formatFCFA(order.amountDue)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
