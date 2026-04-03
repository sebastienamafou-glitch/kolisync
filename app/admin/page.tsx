import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Shield, Store, Users, Package, Wallet, AlertTriangle,
  Activity, List, Filter, Search, CheckCircle2,
  ChevronRight, UserX, Boxes, BarChart3,
  HeartHandshake, Target, Gauge, Zap, FileSearch
} from "lucide-react";
import prismaAdmin from "@/lib/prisma-admin";
import { getSession } from "@/lib/session";

function formatFCFA(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(amount)) + " FCFA";
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return date.toLocaleDateString("fr-FR");
}

const STATUS_SEGMENTS = [
  { key: "DELIVERED_VERIFIED",  label: "Livré",   color: "#10b981" },
  { key: "IN_TRANSIT",          label: "Transit",  color: "#8b5cf6" },
  { key: "PENDING",             label: "Attente",  color: "#334155" },
  { key: "FAILED_RETURNED",     label: "Retour",   color: "#f97316" },
  { key: "CONFLICT",            label: "Conflit",  color: "#ef4444" },
] as const;

export default async function SuperAdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") redirect("/");

  const resolvedParams = await searchParams;
  const currentFilter = resolvedParams.filter ?? "ALL";

  let auditWhere: object = {};
  if (currentFilter === "ALERTS")  auditWhere = { toStatus: { in: ["CONFLICT", "FAILED_RETURNED"] } };
  if (currentFilter === "SUCCESS") auditWhere = { toStatus: { in: ["DELIVERED_VERIFIED", "DELIVERED_UNSECURED"] } };
  if (currentFilter === "TRANSIT") auditWhere = { toStatus: { in: ["DISPATCHED", "IN_TRANSIT"] } };

  // 🚨 AJOUT : pendingKycCount
  const [
    totalTenants, proTenants, totalDrivers, totalOrders, cashInCirculation,
    activeDisputes, socialFundTotal, customerRisks, deliveredCount,
    unsecuredCount, failedCount, conflictCount, inTransitCount,
    pendingCount, topTenants, recentEvents, pendingKycCount
  ] = await Promise.all([
    prismaAdmin.tenant.count(),
    prismaAdmin.tenant.count({ where: { isPro: true } }),
    prismaAdmin.user.count({ where: { role: "DRIVER" } }),
    prismaAdmin.order.count(),
    prismaAdmin.order.aggregate({ where: { cashStatus: "HELD_BY_DRIVER" }, _sum: { amountDue: true } }),
    prismaAdmin.dispute.count(),
    prismaAdmin.socialWallet.aggregate({ _sum: { balance: true } }),
    prismaAdmin.customerRisk.count({ where: { reportCount: { gte: 2 } } }),
    prismaAdmin.order.count({ where: { packageStatus: "DELIVERED_VERIFIED" } }),
    prismaAdmin.order.count({ where: { packageStatus: "DELIVERED_UNSECURED" } }),
    prismaAdmin.order.count({ where: { packageStatus: "FAILED_RETURNED" } }),
    prismaAdmin.order.count({ where: { packageStatus: "CONFLICT" } }),
    prismaAdmin.order.count({ where: { packageStatus: "IN_TRANSIT" } }),
    prismaAdmin.order.count({ where: { packageStatus: "PENDING" } }),
    prismaAdmin.tenant.findMany({
      take: 6,
      include: { _count: { select: { orders: true } } },
      orderBy: { orders: { _count: "desc" } },
    }),
    prismaAdmin.packageEvent.findMany({
      where: auditWhere,
      orderBy: { createdAt: "desc" },
      take: 60,
      include: {
        author: { select: { name: true, role: true } },
        order: { select: { id: true, customerName: true, amountDue: true } },
        tenant: { select: { name: true } },
      },
    }),
    prismaAdmin.user.count({ where: { kycStatus: "PENDING" } }), // NOUVEAU
  ]);

  const cashRisk    = cashInCirculation._sum.amountDue ?? 0;
  const socialFund  = socialFundTotal._sum.balance ?? 0;
  const successRate = totalOrders > 0 ? Math.round(((deliveredCount + unsecuredCount) / totalOrders) * 100) : 0;
  const failRate    = totalOrders > 0 ? Math.round((failedCount / totalOrders) * 100) : 0;

  const statusData = [
    { key: "DELIVERED_VERIFIED", count: deliveredCount, color: "#10b981", label: "Livré ✓" },
    { key: "IN_TRANSIT",         count: inTransitCount,  color: "#8b5cf6", label: "Transit" },
    { key: "PENDING",            count: pendingCount,    color: "#334155", label: "Attente" },
    { key: "FAILED_RETURNED",    count: failedCount,     color: "#f97316", label: "Retour" },
    { key: "CONFLICT",           count: conflictCount,   color: "#ef4444", label: "Conflit" },
  ];

  const riskLevel =
    activeDisputes > 5 || customerRisks > 5 || conflictCount > 3 || pendingKycCount > 10
      ? { label: "CRITIQUE", textClass: "text-red-400",   borderClass: "border-red-900/40",   bgClass: "bg-red-950/30" }
      : activeDisputes > 0 || conflictCount > 0 || pendingKycCount > 0
      ? { label: "MODÉRÉ",   textClass: "text-amber-400", borderClass: "border-amber-900/40", bgClass: "bg-amber-950/30" }
      : { label: "NOMINAL",  textClass: "text-emerald-400", borderClass: "border-emerald-900/40", bgClass: "bg-emerald-950/20" };

  const nowStr = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        :root { --cyan: #06b6d4; --amber: #f59e0b; --red: #ef4444; --green: #10b981; --violet: #8b5cf6; }
        .f-display { font-family: 'Syne', sans-serif; }
        .f-mono    { font-family: 'JetBrains Mono', monospace; }
        .f-body    { font-family: 'DM Sans', sans-serif; }

        .hq-grid {
          background-image: linear-gradient(rgba(6,182,212,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,.025) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        @keyframes scanline { 0% { top: -2px; } 100% { top: 100%; } }
        .scan-wrap { position: relative; overflow: hidden; }
        .scan-wrap::after {
          content: ''; position: absolute; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(6,182,212,.35), transparent);
          animation: scanline 6s linear infinite; pointer-events: none;
        }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .a1 { animation: fadeUp .45s ease both; } .a2 { animation: fadeUp .45s ease .06s both; }
        .a3 { animation: fadeUp .45s ease .12s both; } .a4 { animation: fadeUp .45s ease .18s both; }

        .card { transition: box-shadow .25s ease, border-color .25s ease; }
        .card:hover { box-shadow: 0 0 28px 2px rgba(6,182,212,.07); border-color: rgba(6,182,212,.25) !important; }

        .audit-scroll { scrollbar-width: thin; scrollbar-color: #1e293b transparent; }
        .audit-scroll::-webkit-scrollbar { width: 4px; }
        .audit-scroll::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }

        .pill-success { background: rgba(16,185,129,.12); color: #10b981; border: 1px solid rgba(16,185,129,.25); }
        .pill-alert   { background: rgba(239,68,68,.12);  color: #ef4444; border: 1px solid rgba(239,68,68,.25); }
        .pill-neutral { background: rgba(71,85,105,.25);  color: #94a3b8; border: 1px solid rgba(71,85,105,.3); }

        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .bar-shimmer { background: linear-gradient(90deg, #06b6d4 0%, #818cf8 50%, #06b6d4 100%); background-size: 200% auto; animation: shimmer 3s linear infinite; }
      `}</style>

      <div className="min-h-screen bg-gray-950 text-slate-50 f-body hq-grid selection:bg-cyan-500/20">

        <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-gray-950/85 backdrop-blur-2xl">
          <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <Shield className="h-4 w-4 text-cyan-400" />
              </div>
              <span className="f-display text-base font-bold text-white">KoliSync</span>
              <span className="f-mono text-[9px] font-bold uppercase tracking-[.2em] text-cyan-500/50 border border-cyan-500/15 rounded px-1.5 py-0.5">HQ</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="hidden md:flex flex-col items-end">
                <span className="f-mono text-[11px] text-slate-400">{nowStr}</span>
                <span className="f-mono text-[9px] text-slate-600 capitalize">{dateStr}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-800/40">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="f-mono text-[10px] font-bold text-emerald-400 tracking-widest">LIVE</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-screen-2xl mx-auto px-6 md:px-8 pt-8 pb-24 space-y-8">

          <div className="a1">
            <p className="f-mono text-[10px] font-bold uppercase tracking-[.22em] text-cyan-500/40 mb-1.5">
              Tour de contrôle · SuperAdmin
            </p>
            <h1 className="f-display text-3xl md:text-4xl font-black text-white leading-none">
              Vue d'ensemble système
            </h1>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 a2">
            <div className="card rounded-2xl bg-slate-900/60 border border-slate-800/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <Store className="h-3.5 w-3.5 text-slate-600" />
                <span className="f-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">Boutiques</span>
              </div>
              <p className="f-mono text-3xl font-bold text-white leading-none">{totalTenants}</p>
              <p className="text-[11px] text-emerald-500 mt-2 font-semibold">{proTenants} Pro actives</p>
            </div>
            <div className="card rounded-2xl bg-slate-900/60 border border-slate-800/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-3.5 w-3.5 text-slate-600" />
                <span className="f-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">Livreurs</span>
              </div>
              <p className="f-mono text-3xl font-bold text-white leading-none">{totalDrivers}</p>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Flotte enregistrée</p>
            </div>
            <div className="card rounded-2xl bg-slate-900/60 border border-slate-800/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <Package className="h-3.5 w-3.5 text-slate-600" />
                <span className="f-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">Colis</span>
              </div>
              <p className="f-mono text-3xl font-bold text-white leading-none">{totalOrders}</p>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Total historique</p>
            </div>
            <div className="card rounded-2xl bg-slate-900/60 border border-slate-800/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <Target className="h-3.5 w-3.5 text-emerald-600" />
                <span className="f-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">Réussite</span>
              </div>
              <p className="f-mono text-3xl font-bold text-emerald-400 leading-none">{successRate}%</p>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Taux de livraison</p>
            </div>
            <div className={`card rounded-2xl border p-5 ${activeDisputes > 0 ? "bg-amber-950/30 border-amber-900/40" : "bg-slate-900/60 border-slate-800/50"}`}>
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className={`h-3.5 w-3.5 ${activeDisputes > 0 ? "text-amber-500" : "text-slate-600"}`} />
                <span className="f-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">Litiges</span>
              </div>
              <p className={`f-mono text-3xl font-bold leading-none ${activeDisputes > 0 ? "text-amber-400" : "text-white"}`}>{activeDisputes}</p>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">En attente d'arbitrage</p>
            </div>
            <div className={`card rounded-2xl border p-5 ${customerRisks > 0 ? "bg-red-950/25 border-red-900/40" : "bg-slate-900/60 border-slate-800/50"}`}>
              <div className="flex items-center justify-between mb-4">
                <UserX className={`h-3.5 w-3.5 ${customerRisks > 0 ? "text-red-500" : "text-slate-600"}`} />
                <span className="f-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">Risques</span>
              </div>
              <p className={`f-mono text-3xl font-bold leading-none ${customerRisks > 0 ? "text-red-400" : "text-white"}`}>{customerRisks}</p>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Clients signalés (≥2×)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 a3">
            <div className="lg:col-span-2 space-y-6">
              <div className="scan-wrap card rounded-3xl border border-slate-800/50 bg-gradient-to-br from-slate-900 to-gray-950 p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                  <div>
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center">
                        <Wallet className="h-4 w-4 text-cyan-400" />
                      </div>
                      <span className="text-sm font-semibold text-slate-400">Exposition Financière</span>
                    </div>
                    <p className="f-mono text-4xl md:text-5xl font-bold text-white tracking-tighter leading-none">
                      {formatFCFA(cashRisk)}
                    </p>
                    <p className="text-sm text-slate-500 mt-3 leading-relaxed max-w-sm">
                      COD actuellement dans les poches des livreurs,<br />
                      en attente de reversement aux boutiques.
                    </p>
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
                      <div
                        key={s.key}
                        style={{ width: `${(s.count / totalOrders) * 100}%`, backgroundColor: s.color }}
                        className="first:rounded-l-full last:rounded-r-full transition-all duration-700"
                        title={`${s.label} : ${s.count}`}
                      />
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
                      <p className="f-mono text-[10px] text-slate-600 pl-3.5">
                        {totalOrders > 0 ? Math.round((s.count / totalOrders) * 100) : 0}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className={`card rounded-3xl border p-6 ${riskLevel.bgClass} ${riskLevel.borderClass}`}>
                <div className="flex items-center gap-2 mb-4">
                  <Gauge className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Niveau de risque</span>
                </div>
                <p className={`f-display text-3xl font-black mb-4 ${riskLevel.textClass}`}>{riskLevel.label}</p>
                <div className="space-y-2.5">
                  {[
                    { label: "Dossiers KYC",       value: pendingKycCount, color: "text-amber-400" },
                    { label: "Litiges ouverts",    value: activeDisputes,  color: "text-amber-400" },
                    { label: "Clients signalés",   value: customerRisks,   color: "text-red-400" },
                    { label: "Colis en conflit",   value: conflictCount,   color: "text-red-400" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">{row.label}</span>
                      <span className={`f-mono text-sm font-bold ${row.value > 0 ? row.color : "text-slate-600"}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🚨 AJOUT DE LA SECTION KYC ICI */}
              <div className="card rounded-3xl border border-slate-800/50 bg-slate-900/60 p-5 space-y-2">
                <p className="f-mono text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-3">Accès rapide</p>
                
                <Link href="/admin/kyc" className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800/50 bg-slate-800/20 hover:bg-slate-800/50 hover:border-emerald-500/20 transition-all group">
                  <div className="flex items-center gap-3">
                    <FileSearch className="h-5 w-5 text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Vérifications KYC</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{pendingKycCount} dossiers en attente</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-500 transition-colors" />
                </Link>

                <Link href="/admin/disputes" className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800/50 bg-slate-800/20 hover:bg-slate-800/50 hover:border-amber-500/20 transition-all group">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500/50 group-hover:text-amber-400 transition-colors" />
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Arbitrage litiges</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{activeDisputes} en attente</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-amber-500 transition-colors" />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 a4">
            <div className="lg:col-span-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Audit Log</span>
                  <span className="f-mono text-[10px] text-slate-600">· {recentEvents.length} événements</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-slate-600 mr-1 shrink-0" />
                  {[
                    { href: "/admin",              label: "Tout",    filter: "ALL"     },
                    { href: "/admin?filter=ALERTS", label: "Alertes", filter: "ALERTS"  },
                    { href: "/admin?filter=SUCCESS",label: "Succès",  filter: "SUCCESS" },
                  ].map(f => (
                    <Link
                      key={f.filter}
                      href={f.href}
                      className={`shrink-0 px-3 py-1.5 rounded-lg f-mono text-[10px] font-bold uppercase tracking-wide transition-all ${
                        currentFilter === f.filter
                          ? "bg-cyan-500 text-gray-950"
                          : "bg-slate-800/60 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                      }`}
                    >
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
                            <p className="text-sm text-white font-medium leading-snug truncate">
                              {event.reason ?? `Transition → ${event.toStatus.replace(/_/g, " ")}`}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                              <span className="text-[11px] font-semibold text-slate-400">{event.tenant.name}</span>
                              <span className="text-slate-700">·</span>
                              <span className="text-[11px] text-slate-500">{event.author.name}</span>
                              <span className="f-mono text-[11px] text-slate-600">#{event.order.id.slice(-6).toUpperCase()}</span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className={`f-mono inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${pillClass}`}>
                              {event.toStatus.replace(/_/g, " ")}
                            </span>
                            <p className="f-mono text-[10px] text-slate-600 mt-1.5">{timeAgo(event.createdAt)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div>
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
                                <p className="text-[10px] mt-0.5">
                                  {tenant.isPro ? <span className="text-cyan-500 font-bold">PRO</span> : <span className="text-slate-600">FREE</span>}
                                </p>
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
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
