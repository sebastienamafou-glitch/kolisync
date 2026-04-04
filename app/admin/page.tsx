import prismaAdmin from "@/lib/prisma-admin";
import { AdminMetricsGrid, AdminFinancialOverview, AdminRiskPanel, AdminAuditLog, AdminTopTenants } from "@/features/admin/AdminDashboardWidgets";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentFilter = resolvedParams.filter ?? "ALL";

  let auditWhere: object = {};
  if (currentFilter === "ALERTS")  auditWhere = { toStatus: { in: ["CONFLICT", "FAILED_RETURNED"] } };
  if (currentFilter === "SUCCESS") auditWhere = { toStatus: { in: ["DELIVERED_VERIFIED", "DELIVERED_UNSECURED"] } };

  // 1. Récupération optimisée en parallèle
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
    prismaAdmin.tenant.findMany({ take: 6, include: { _count: { select: { orders: true } } }, orderBy: { orders: { _count: "desc" } } }),
    prismaAdmin.packageEvent.findMany({
      where: auditWhere, orderBy: { createdAt: "desc" }, take: 60,
      include: { author: { select: { name: true, role: true } }, order: { select: { id: true, customerName: true, amountDue: true } }, tenant: { select: { name: true } } },
    }),
    prismaAdmin.user.count({ where: { kycStatus: "PENDING" } }),
  ]);

  // 2. Calcul des métriques dérivées
  const cashRisk    = cashInCirculation._sum.amountDue ?? 0;
  const socialFund  = socialFundTotal._sum.balance ?? 0;
  const successRate = totalOrders > 0 ? Math.round(((deliveredCount + unsecuredCount) / totalOrders) * 100) : 0;
  const failRate    = totalOrders > 0 ? Math.round((failedCount / totalOrders) * 100) : 0;

  const statusData = [
    { key: "DELIVERED_VERIFIED", count: deliveredCount, color: "#10b981", label: "Livré ✓" },
    { key: "IN_TRANSIT",         count: inTransitCount, color: "#8b5cf6", label: "Transit" },
    { key: "PENDING",            count: pendingCount,   color: "#334155", label: "Attente" },
    { key: "FAILED_RETURNED",    count: failedCount,    color: "#f97316", label: "Retour" },
    { key: "CONFLICT",           count: conflictCount,  color: "#ef4444", label: "Conflit" },
  ];

  const riskLevel =
    activeDisputes > 5 || customerRisks > 5 || conflictCount > 3 || pendingKycCount > 10
      ? { label: "CRITIQUE", textClass: "text-red-400",   borderClass: "border-red-900/40",   bgClass: "bg-red-950/30" }
      : activeDisputes > 0 || conflictCount > 0 || pendingKycCount > 0
      ? { label: "MODÉRÉ",   textClass: "text-amber-400", borderClass: "border-amber-900/40", bgClass: "bg-amber-950/30" }
      : { label: "NOMINAL",  textClass: "text-emerald-400", borderClass: "border-emerald-900/40", bgClass: "bg-emerald-950/20" };

  const riskStats = [
    { label: "Dossiers KYC", value: pendingKycCount, color: "text-amber-400" },
    { label: "Litiges ouverts", value: activeDisputes, color: "text-amber-400" },
    { label: "Clients signalés", value: customerRisks, color: "text-red-400" },
    { label: "Colis en conflit", value: conflictCount, color: "text-red-400" }
  ];

  // 3. Rendu structuré (Injection des props dans les Presenters)
  return (
    <main className="max-w-screen-2xl mx-auto px-6 md:px-8 pt-8 pb-24 space-y-8">
      <div className="a1">
        <p className="f-mono text-[10px] font-bold uppercase tracking-[.22em] text-cyan-500/40 mb-1.5">Tour de contrôle · Admin</p>
        <h1 className="f-display text-3xl md:text-4xl font-black text-white leading-none">Vue d'ensemble système</h1>
      </div>

      <AdminMetricsGrid data={{ totalTenants, proTenants, totalDrivers, totalOrders, successRate, activeDisputes, customerRisks }} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 a3">
        <div className="lg:col-span-2 space-y-6">
          <AdminFinancialOverview cashRisk={cashRisk} socialFund={socialFund} failRate={failRate} statusData={statusData} totalOrders={totalOrders} />
        </div>
        <div className="space-y-5">
          <AdminRiskPanel riskLevel={riskLevel} stats={riskStats} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 a4">
        <div className="lg:col-span-2">
          <AdminAuditLog recentEvents={recentEvents as any} currentFilter={currentFilter} />
        </div>
        <div>
          <AdminTopTenants topTenants={topTenants} />
        </div>
      </div>
    </main>
  );
}
