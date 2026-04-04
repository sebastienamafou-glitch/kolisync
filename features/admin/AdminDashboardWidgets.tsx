import Link from "next/link";
import { Store, Users, Package, Target, AlertTriangle, UserX, Wallet, BarChart3, Gauge, FileSearch, ChevronRight, Activity, Filter, Search, Boxes } from "lucide-react";

export function formatFCFA(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(amount)) + " FCFA";
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return date.toLocaleDateString("fr-FR");
}

export function AdminMetricsGrid({ data }: { data: any }) { // Types inférés via passage de prop simplifiée pour l'exemple global
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 a2">
      <div className="card rounded-2xl bg-slate-900/60 border border-slate-800/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <Store className="h-3.5 w-3.5 text-slate-600" />
          <span className="f-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">Boutiques</span>
        </div>
        <p className="f-mono text-3xl font-bold text-white leading-none">{data.totalTenants}</p>
        <p className="text-[11px] text-emerald-500 mt-2 font-semibold">{data.proTenants} Pro actives</p>
      </div>
      <div className="card rounded-2xl bg-slate-900/60 border border-slate-800/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <Users className="h-3.5 w-3.5 text-slate-600" />
          <span className="f-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">Livreurs</span>
        </div>
        <p className="f-mono text-3xl font-bold text-white leading-none">{data.totalDrivers}</p>
        <p className="text-[11px] text-slate-500 mt-2 font-medium">Flotte enregistrée</p>
      </div>
      <div className="card rounded-2xl bg-slate-900/60 border border-slate-800/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <Package className="h-3.5 w-3.5 text-slate-600" />
          <span className="f-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">Colis</span>
        </div>
        <p className="f-mono text-3xl font-bold text-white leading-none">{data.totalOrders}</p>
        <p className="text-[11px] text-slate-500 mt-2 font-medium">Total historique</p>
      </div>
      <div className="card rounded-2xl bg-slate-900/60 border border-slate-800/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <Target className="h-3.5 w-3.5 text-emerald-600" />
          <span className="f-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">Réussite</span>
        </div>
        <p className="f-mono text-3xl font-bold text-emerald-400 leading-none">{data.successRate}%</p>
        <p className="text-[11px] text-slate-500 mt-2 font-medium">Taux de livraison</p>
      </div>
      <div className={`card rounded-2xl border p-5 ${data.activeDisputes > 0 ? "bg-amber-950/30 border-amber-900/40" : "bg-slate-900/60 border-slate-800/50"}`}>
        <div className="flex items-center justify-between mb-4">
          <AlertTriangle className={`h-3.5 w-3.5 ${data.activeDisputes > 0 ? "text-amber-500" : "text-slate-600"}`} />
          <span className="f-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">Litiges</span>
        </div>
        <p className={`f-mono text-3xl font-bold leading-none ${data.activeDisputes > 0 ? "text-amber-400" : "text-white"}`}>{data.activeDisputes}</p>
        <p className="text-[11px] text-slate-500 mt-2 font-medium">En attente d'arbitrage</p>
      </div>
      <div className={`card rounded-2xl border p-5 ${data.customerRisks > 0 ? "bg-red-950/25 border-red-900/40" : "bg-slate-900/60 border-slate-800/50"}`}>
        <div className="flex items-center justify-between mb-4">
          <UserX className={`h-3.5 w-3.5 ${data.customerRisks > 0 ? "text-red-500" : "text-slate-600"}`} />
          <span className="f-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">Risques</span>
        </div>
        <p className={`f-mono text-3xl font-bold leading-none ${data.customerRisks > 0 ? "text-red-400" : "text-white"}`}>{data.customerRisks}</p>
        <p className="text-[11px] text-slate-500 mt-2 font-medium">Clients signalés (≥2×)</p>
      </div>
    </div>
  );
}

export function AdminFinancialOverview({ cashRisk, socialFund, failRate, statusData, totalOrders }: { cashRisk: number, socialFund: number, failRate: number, statusData: any[], totalOrders: number }) {
  return (
    <>
      <div className="scan-wrap card rounded-3xl border border-slate-800/50 bg-gradient-to-br from-slate-900 to-gray-950 p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-cyan-400" />
              </div>
              <span className="text-sm font-semibold text-slate-400">Exposition Financière</span>
            </div>
            <p className="f-mono text-4xl md:text-5xl font-bold text-white tracking-tighter leading-none">{formatFCFA(cashRisk)}</p>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed max-w-sm">COD actuellement dans les poches des livreurs,<br />en attente de reversement aux boutiques.</p>
          </div>
          <div className="flex flex-col gap-3 shrink-0 min-w-[180px]">
            <div className="card rounded-2xl bg-slate-800/40 border border-slate-700/40 px-5 py-4">
              <p className="f-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">Fonds Social</p>
              <p className="f-mono text-lg font-bold text-cyan-400">{formatFCFA(socialFund)}</p>
            </div>
            <div className="card rounded-2xl bg-slate-800/40 border border-slate-700/40 px-5 py-4">
              <p className="f-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">Taux d'échec</p>
              <p className="f-mono text-lg font-bold text-orange-400">{failRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card rounded-3xl border border-slate-800/50 bg-slate-900/60 p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Répartition des statuts</span>
        </div>
        {totalOrders > 0 && (
          <div className="flex h-2.5 rounded-full overflow-hidden gap-[2px] mb-6">
            {statusData.filter(s => s.count > 0).map(s => (
              <div key={s.key} style={{ width: `${(s.count / totalOrders) * 100}%`, backgroundColor: s.color }} className="first:rounded-l-full last:rounded-r-full transition-all duration-700" title={`${s.label} : ${s.count}`} />
            ))}
          </div>
        )}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          {statusData.map(s => (
            <div key={s.key}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="f-mono text-[10px] text-slate-500">{s.label}</span>
              </div>
              <p className="f-mono text-xl font-bold text-white pl-3.5">{s.count}</p>
              <p className="f-mono text-[10px] text-slate-600 pl-3.5">{totalOrders > 0 ? Math.round((s.count / totalOrders) * 100) : 0}%</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function AdminRiskPanel({ riskLevel, stats }: { riskLevel: any, stats: any[] }) {
  return (
    <>
      <div className={`card rounded-3xl border p-6 ${riskLevel.bgClass} ${riskLevel.borderClass}`}>
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Niveau de risque</span>
        </div>
        <p className={`f-display text-3xl font-black mb-4 ${riskLevel.textClass}`}>{riskLevel.label}</p>
        <div className="space-y-2.5">
          {stats.map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">{row.label}</span>
              <span className={`f-mono text-sm font-bold ${row.value > 0 ? row.color : "text-slate-600"}`}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="card rounded-3xl border border-slate-800/50 bg-slate-900/60 p-5 space-y-2">
        <p className="f-mono text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-3">Accès rapide</p>
        <Link href="/admin/kyc" className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800/50 bg-slate-800/20 hover:bg-slate-800/50 hover:border-emerald-500/20 transition-all group">
          <div className="flex items-center gap-3">
            <FileSearch className="h-5 w-5 text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
            <div>
              <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Vérifications KYC</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{stats[0].value} dossiers en attente</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-500 transition-colors" />
        </Link>
        <Link href="/admin/disputes" className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800/50 bg-slate-800/20 hover:bg-slate-800/50 hover:border-amber-500/20 transition-all group">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500/50 group-hover:text-amber-400 transition-colors" />
            <div>
              <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Arbitrage litiges</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{stats[1].value} en attente</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-amber-500 transition-colors" />
        </Link>
      </div>
    </>
  );
}

export interface AuditEvent { id: string; toStatus: string; reason: string | null; createdAt: Date; tenant: { name: string }; author: { name: string }; order: { id: string } }

export function AdminAuditLog({ recentEvents, currentFilter }: { recentEvents: AuditEvent[], currentFilter: string }) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Audit Log</span>
          <span className="f-mono text-[10px] text-slate-600">· {recentEvents.length} événements</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-slate-600 mr-1 shrink-0" />
          {[ { href: "/admin", label: "Tout", filter: "ALL" }, { href: "/admin?filter=ALERTS", label: "Alertes", filter: "ALERTS" }, { href: "/admin?filter=SUCCESS", label: "Succès", filter: "SUCCESS" } ].map(f => (
            <Link key={f.filter} href={f.href} className={`shrink-0 px-3 py-1.5 rounded-lg f-mono text-[10px] font-bold uppercase tracking-wide transition-all ${currentFilter === f.filter ? "bg-cyan-500 text-gray-950" : "bg-slate-800/60 text-slate-500 hover:bg-slate-800 hover:text-slate-300"}`}>
              {f.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-slate-800/50 bg-slate-900/60 overflow-hidden">
        {recentEvents.length === 0 ? (
          <div className="p-16 text-center text-slate-600">
            <Search className="h-7 w-7 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">Aucun événement pour ce filtre.</p>
          </div>
        ) : (
          <div className="audit-scroll divide-y divide-slate-800/30 max-h-[580px] overflow-y-auto">
            {recentEvents.map(event => {
              const isConflict = event.toStatus === "CONFLICT" || event.toStatus === "FAILED_RETURNED";
              const isSuccess  = event.toStatus === "DELIVERED_VERIFIED" || event.toStatus === "DELIVERED_UNSECURED";
              const dotColor   = isConflict ? "bg-red-500" : isSuccess ? "bg-emerald-500" : "bg-blue-500";
              const pillClass  = isConflict ? "pill-alert" : isSuccess ? "pill-success" : "pill-neutral";
              return (
                <div key={event.id} className="px-5 py-3.5 flex items-start gap-4 hover:bg-slate-800/25 transition-colors">
                  <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium leading-snug truncate">{event.reason ?? `Transition → ${event.toStatus.replace(/_/g, " ")}`}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                      <span className="text-[11px] font-semibold text-slate-400">{event.tenant.name}</span>
                      <span className="text-slate-700">·</span>
                      <span className="text-[11px] text-slate-500">{event.author.name}</span>
                      <span className="f-mono text-[11px] text-slate-600">#{event.order.id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`f-mono inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${pillClass}`}>{event.toStatus.replace(/_/g, " ")}</span>
                    <p className="f-mono text-[10px] text-slate-600 mt-1.5">{timeAgo(event.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export function AdminTopTenants({ topTenants }: { topTenants: any[] }) {
  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Boxes className="h-4 w-4 text-slate-500" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Top Boutiques</span>
      </div>
      <div className="card rounded-3xl border border-slate-800/50 bg-slate-900/60 overflow-hidden">
        {topTenants.length === 0 ? (
          <p className="p-8 text-sm text-center text-slate-600">Aucune boutique</p>
        ) : (
          <div className="divide-y divide-slate-800/30">
            {topTenants.map((tenant, i) => {
              const max = topTenants[0]._count.orders;
              const pct = max > 0 ? (tenant._count.orders / max) * 100 : 0;
              return (
                <div key={tenant.id} className="px-5 py-4 hover:bg-slate-800/25 transition-colors">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="f-mono text-[10px] text-slate-600 w-4 shrink-0">#{i + 1}</span>
                      <div>
                        <p className="text-sm font-bold text-white leading-none">{tenant.name}</p>
                        <p className="text-[10px] mt-0.5">{tenant.isPro ? <span className="text-cyan-500 font-bold">PRO</span> : <span className="text-slate-600">FREE</span>}</p>
                      </div>
                    </div>
                    <span className="f-mono text-sm font-bold text-slate-300">{tenant._count.orders}</span>
                  </div>
                  <div className="h-1 rounded-full bg-slate-800 overflow-hidden ml-6">
                    <div className={`h-full rounded-full transition-all duration-700 ${i === 0 ? "bar-shimmer" : "bg-slate-600"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
