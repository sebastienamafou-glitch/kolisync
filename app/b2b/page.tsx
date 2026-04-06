import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Package, Banknote, CheckCircle2, Clock, Plus, MapPin, 
  Lock, Globe, MessageCircle, ShieldCheck, User, AlertTriangle,
  Filter, BarChart3, Search, ChevronRight, Zap, Eye, ShieldAlert
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { PackageStatus } from "@prisma/client";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatFCFA(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(amount)) + " FCFA";
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return date.toLocaleDateString("fr-FR");
}

// ── Configuration Visuelle ──────────────────────────────────────────────────

const STATUS_CONFIG: Record<PackageStatus, { label: string; color: string; bg: string; text: string }> = {
  DELIVERED_VERIFIED:   { label: "Livré",           color: "#10b981", bg: "bg-emerald-50",  text: "text-emerald-700" },
  DELIVERED_UNSECURED:  { label: "Livré (GPS)",     color: "#f59e0b", bg: "bg-amber-50",    text: "text-amber-700" },
  IN_TRANSIT:           { label: "En route",        color: "#3b82f6", bg: "bg-blue-50",     text: "text-blue-700" },
  DISPATCHED:           { label: "Assigné",         color: "#8b5cf6", bg: "bg-violet-50",   text: "text-violet-700" },
  AVAILABLE_PUBLIC:     { label: "Bourse",          color: "#d946ef", bg: "bg-fuchsia-50",  text: "text-fuchsia-700" },
  PENDING:              { label: "En attente",      color: "#64748b", bg: "bg-slate-100",   text: "text-slate-600" },
  FAILED_RETURNED:      { label: "Retourné",        color: "#f97316", bg: "bg-orange-50",   text: "text-orange-700" },
  CONFLICT:             { label: "Litige",          color: "#ef4444", bg: "bg-red-50",      text: "text-red-700" },
};

function StatusBadge({ status }: { status: PackageStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}

// ── Page Dashboard B2B ─────────────────────────────────────────────────────

export default async function B2BDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "OWNER") redirect("/");

  // 🚨 Variable d'environnement pour le Tracking Link (DRY)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kolisync.vercel.app";

  const tenantId = session.tenantId;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const resolvedParams = await searchParams;
  const currentFilter = resolvedParams.filter ?? "ALL";

  // ── Moteur de filtres dynamique ──
  let orderWhere: object = { tenantId };
  if (currentFilter === "TRANSIT") orderWhere = { ...orderWhere, packageStatus: { in: ["IN_TRANSIT", "DISPATCHED"] } };
  if (currentFilter === "ALERTS")  orderWhere = { ...orderWhere, packageStatus: { in: ["CONFLICT", "FAILED_RETURNED"] } };
  if (currentFilter === "SUCCESS") orderWhere = { ...orderWhere, packageStatus: { in: ["DELIVERED_VERIFIED", "DELIVERED_UNSECURED"] } };

  // ── Fetching Parallèle (Performances) ──
  const [
    inTransitCount,
    heldCashAgg,
    successfulDeliveriesCount,
    monthlyTotalCount,
    disputesCount,
    statusGroups,
    filteredOrders,
    heldCashOrders
  ] = await Promise.all([
    prisma.order.count({ where: { tenantId, packageStatus: "IN_TRANSIT" } }),
    prisma.order.aggregate({ 
      where: { tenantId, cashStatus: "HELD_BY_DRIVER" }, 
      _sum: { amountDue: true, deliveryFee: true } 
    }),
    prisma.order.count({ where: { tenantId, packageStatus: { in: ["DELIVERED_VERIFIED", "DELIVERED_UNSECURED"] }, createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { tenantId, createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { tenantId, packageStatus: "CONFLICT" } }),
    prisma.order.groupBy({
      by: ['packageStatus'],
      where: { tenantId, createdAt: { gte: startOfMonth } },
      _count: true
    }),
    prisma.order.findMany({
      where: orderWhere,
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { 
        id: true, customerName: true, customerPhone: true, commune: true,
        amountDue: true, deliveryFee: true, packageStatus: true,
        securityPin: true, isPublic: true, createdAt: true,
        driver: { select: { name: true } }
      },
    }),
    prisma.order.findMany({
      where: { tenantId, cashStatus: "HELD_BY_DRIVER" },
      select: { id: true, amountDue: true, deliveryFee: true, customerName: true, driver: { select: { name: true } } }
    })
  ]);

  // 🚨 KOLISYNC TRUST ENGINE : Requête groupée (O(1)) pour les numéros de la liste
  const displayedPhones = [...new Set(filteredOrders.map(o => o.customerPhone))];
  const riskProfiles = await prisma.customerRisk.findMany({
    where: { 
      customerPhone: { in: displayedPhones },
      reportCount: { gte: 2 } // On ne récupère que les profils suspects
    },
    select: { customerPhone: true, reportCount: true }
  });
  // Création d'un dictionnaire pour une lecture ultra-rapide côté rendu
  const riskMap = new Map(riskProfiles.map(r => [r.customerPhone, r.reportCount]));

  const cashToReconcile = Math.max(0, (heldCashAgg._sum.amountDue || 0) - (heldCashAgg._sum.deliveryFee || 0));
  const successRate = monthlyTotalCount > 0 ? Math.round((successfulDeliveriesCount / monthlyTotalCount) * 100) : 0;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .a1 { animation: fadeUp .45s ease both; }
        .a2 { animation: fadeUp .45s ease .06s both; }
        .a3 { animation: fadeUp .45s ease .12s both; }
        
        .card-pro {
          transition: all 0.25s ease;
        }
        .card-pro:hover {
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .list-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .list-scroll::-webkit-scrollbar { width: 4px; }
        .list-scroll::-webkit-scrollbar-track { background: transparent; }
        .list-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>

      <div className="space-y-8 pb-16 font-sans">
        
        {/* ── HEADER & ACTIONS ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between a1">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Tableau de bord</h1>
            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Synchronisé en temps réel
            </p>
          </div>
          <Link href="/b2b/create" className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition-transform hover:bg-slate-800 active:scale-95">
            <Plus className="h-5 w-5" />
            Nouvelle expédition
          </Link>
        </div>

        {/* ── KPI GRID ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 a2">
          <div className="card-pro rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><Package className="h-5 w-5" /></div>
              <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Logistique</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{inTransitCount}</p>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">Colis en route</p>
          </div>

          <div className="card-pro rounded-[2rem] bg-slate-900 p-6 shadow-xl text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-400/10 blur-xl" />
            <div className="mb-4 flex items-center justify-between relative z-10">
              <div className="rounded-xl bg-white/10 p-2.5 text-emerald-400"><Banknote className="h-5 w-5" /></div>
              <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">Finances</span>
            </div>
            <p className="text-3xl font-black text-white relative z-10 leading-tight">{formatFCFA(cashToReconcile)}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 relative z-10">Cash chez les livreurs</p>
          </div>

          <div className="card-pro rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></div>
              <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Performance</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-slate-900">{successRate}%</p>
              <p className="text-sm font-bold text-slate-400">({successfulDeliveriesCount})</p>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">Taux de réussite (Mois)</p>
          </div>

          <div className={`card-pro rounded-[2rem] p-6 shadow-sm ring-1 transition-colors ${disputesCount > 0 ? "bg-red-50 ring-red-100" : "bg-white ring-slate-100"}`}>
            <div className="mb-4 flex items-center justify-between">
              <div className={`rounded-xl p-2.5 ${disputesCount > 0 ? "bg-red-100 text-red-600" : "bg-slate-50 text-slate-400"}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              {disputesCount > 0 && <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />}
            </div>
            <p className={`text-3xl font-black ${disputesCount > 0 ? "text-red-600" : "text-slate-900"}`}>{disputesCount}</p>
            <p className={`text-[11px] font-bold uppercase tracking-widest mt-1 ${disputesCount > 0 ? "text-red-500" : "text-slate-400"}`}>Litiges ouverts</p>
          </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 a3">
          
          {/* COLONNE GAUCHE : FLUX & OPÉRATIONS (2/3) */}
          <div className="xl:col-span-2 space-y-6">
            
            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-900">Répartition du mois</span>
              </div>
              {monthlyTotalCount > 0 ? (
                <>
                  <div className="flex h-3 rounded-full overflow-hidden gap-[2px] mb-6">
                    {statusGroups.map(sg => {
                      const cfg = STATUS_CONFIG[sg.packageStatus] || STATUS_CONFIG.PENDING;
                      return (
                        <div 
                          key={sg.packageStatus} 
                          style={{ width: `${(sg._count / monthlyTotalCount) * 100}%`, backgroundColor: cfg.color }}
                          className="first:rounded-l-full last:rounded-r-full transition-all duration-500"
                          title={`${cfg.label} : ${sg._count}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {statusGroups.map(sg => {
                      const cfg = STATUS_CONFIG[sg.packageStatus] || STATUS_CONFIG.PENDING;
                      return (
                        <div key={sg.packageStatus} className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                          <span className="text-[10px] font-bold uppercase text-slate-500">{cfg.label} <span className="text-slate-900 ml-0.5">{sg._count}</span></span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-sm font-medium text-slate-400">Aucune donnée pour ce mois.</p>
              )}
            </div>

            {/* Liste filtrable des commandes */}
            <div className="rounded-[2.5rem] bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden flex flex-col h-[600px]">
              {/* Toolbar */}
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-2 px-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-900">Suivi Logistique</span>
                </div>
                
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                  <Filter className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
                  {[
                    { filter: "ALL", label: "Tout" },
                    { filter: "TRANSIT", label: "En cours" },
                    { filter: "SUCCESS", label: "Livrés" },
                    { filter: "ALERTS", label: "Problèmes" },
                  ].map(f => (
                    <Link
                      key={f.filter}
                      href={`/b2b?filter=${f.filter}`}
                      className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        currentFilter === f.filter
                          ? "bg-slate-900 text-white shadow-md"
                          : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {f.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Data List */}
              <div className="flex-1 overflow-y-auto list-scroll p-2">
                {filteredOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                    <Search className="h-8 w-8 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">Aucun résultat pour ce filtre.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredOrders.map(order => {
                      const isActive = !["DELIVERED_VERIFIED", "DELIVERED_UNSECURED", "FAILED_RETURNED"].includes(order.packageStatus);
                      
                      // 🚨 GÉNÉRATION DU SMART MESSAGE WHATSAPP
                      const trackingId = order.id.slice(-6).toUpperCase();
                      const trackingLink = `${appUrl}/track/${trackingId}`;
                      const whatsappMessage = 
                        `📦 *KoliSync* - Bonjour ${order.customerName},\n\n` +
                        `Votre colis est prêt et vous a été assigné !\n\n` +
                        `📍 Suivez son avancée en temps réel ici :\n${trackingLink}\n\n` +
                        `🔐 *VOTRE CODE PIN : ${order.securityPin}*\n` +
                        `(Ne le donnez au livreur qu'au moment d'avoir le colis en main).\n\n` +
                        `Merci pour votre confiance !`;
                      
                      const cleanPhone = order.customerPhone?.replace(/\D/g, '') || '';
                      const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
                      
                      // Radar KoliSync
                      const riskCount = riskMap.get(order.customerPhone);
                      const isDanger = riskCount && riskCount >= 3;
                      const isWarning = riskCount && riskCount === 2;

                      return (
                        <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                          
                          <div className="flex items-start gap-4">
                            <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                              <Package className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center flex-wrap gap-2">
                                <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
                                
                                {isDanger && (
                                  <span className="flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-[8px] font-black uppercase text-red-700 ring-1 ring-red-200" title={`Fraudeur potentiel : ${riskCount} signalements`}>
                                    <ShieldAlert className="h-2.5 w-2.5" /> Haut Risque
                                  </span>
                                )}
                                {isWarning && (
                                  <span className="flex items-center gap-1 rounded bg-orange-100 px-1.5 py-0.5 text-[8px] font-black uppercase text-orange-700 ring-1 ring-orange-200" title={`Client suspect : ${riskCount} signalements`}>
                                    <AlertTriangle className="h-2.5 w-2.5" /> Vigilance
                                  </span>
                                )}

                                {order.isPublic && (
                                  <span className="flex items-center gap-1 rounded bg-fuchsia-100 px-1.5 py-0.5 text-[8px] font-black uppercase text-fuchsia-700"><Globe className="h-2.5 w-2.5" /> Pool</span>
                                )}
                              </div>
                              <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" /> {order.commune || "Zone inconnue"}
                                <span className="mx-1 text-slate-300">•</span>
                                {timeAgo(order.createdAt)}
                              </p>
                              {order.driver && (
                                <p className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-2">
                                  <User className="h-3 w-3" /> {order.driver.name}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                            {isActive && order.securityPin && (
                              <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg ring-1 ring-slate-200">
                                <div className="group/pin relative">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-500 hover:text-slate-900 shadow-sm cursor-help">
                                    <Lock className="h-3.5 w-3.5" />
                                  </div>
                                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover/pin:block z-10 w-24">
                                    <div className="rounded-xl bg-slate-900 p-2 text-center shadow-xl">
                                      <p className="text-sm font-black text-white tracking-[0.2em]">{order.securityPin}</p>
                                    </div>
                                  </div>
                                </div>
                                <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white hover:bg-emerald-400 shadow-sm transition-colors" title="Envoyer le code et le lien au client par WhatsApp">
                                  <MessageCircle className="h-3.5 w-3.5" />
                                </a>
                              </div>
                            )}

                            <div className="flex flex-col items-end gap-1.5 min-w-[90px]">
                              <span className="text-sm font-black text-slate-900">{formatFCFA(order.amountDue)}</span>
                              <StatusBadge status={order.packageStatus} />
                            </div>

                            <Link 
                              href={`/b2b/orders/${order.id}`}
                              className="ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors ring-1 ring-slate-200/50"
                              title="Voir les détails et le suivi GPS"
                            >
                              <Eye className="h-5 w-5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                <Link href="/b2b/packages" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center gap-1">
                  Voir tout l'historique <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE : FINANCES & SÉCURITÉ (1/3) */}
          <div className="space-y-6">
            
            <div className="rounded-[2.5rem] bg-slate-900 p-6 shadow-xl relative overflow-hidden border border-slate-800">
              <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
              
              <div className="flex items-center gap-2 mb-6 relative z-10">
                <Banknote className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-widest text-white">Cash en balade</span>
              </div>

              {heldCashOrders.length === 0 ? (
                <div className="py-6 text-center relative z-10">
                   <div className="mx-auto h-12 w-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                   </div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tous les fonds sont à jour</p>
                </div>
              ) : (
                <div className="space-y-3 relative z-10 max-h-[300px] overflow-y-auto list-scroll pr-2">
                  {heldCashOrders.map(order => (
                    <div key={`cash-${order.id}`} className="flex flex-col p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-white text-xs">{order.driver?.name || "Inconnu"}</p>
                        <p className="font-black text-emerald-400 text-sm">{formatFCFA(order.amountDue - order.deliveryFee)}</p>
                      </div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase truncate">Client: {order.customerName}</p>
                    </div>
                  ))}
                </div>
              )}

              {heldCashOrders.length > 0 && (
                <Link href="/b2b/reconciliation" className="mt-5 relative z-10 flex w-full items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3.5 text-xs font-black uppercase tracking-widest text-slate-950 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                  <Zap className="h-4 w-4 mr-2" />
                  Réconcilier les fonds
                </Link>
              )}
            </div>

            <div className="p-6 rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                </div>
                <h3 className="text-sm font-black text-slate-900">Protocole Zéro-Perte</h3>
              </div>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                Le système KoliSync impose un code PIN. Ne l'inscrivez <span className="font-bold text-slate-900">jamais</span> sur l'emballage. Transmettez-le au client final. Sans ce code, le livreur ne peut pas valider la livraison ni réclamer sa prime.
              </p>
            </div>
            
          </div>
        </div>

      </div>
    </>
  );
}
