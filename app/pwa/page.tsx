import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Package, 
  MapPin, 
  Phone, 
  TrendingUp,
  Radar,
  Store,
  Navigation,
  ChevronRight,
  ShieldAlert,
  AlertTriangle
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Import du composant Radar (Server Component)
import AvailableOrdersList from "@/features/driver/AvailableOrdersList";

function formatFCFA(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

export default async function PWADashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "DRIVER") {
    redirect("/");
  }

  // Récupération parallèle : À récupérer, En cours de livraison et Portefeuille
  const [pickups, deliveries, wallet] = await Promise.all([
    prisma.order.findMany({
      where: { 
        driverId: session.userId, 
        packageStatus: "DISPATCHED" 
      },
      orderBy: { updatedAt: "desc" },
      include: { tenant: { select: { name: true } } }
    }),
    prisma.order.findMany({
      where: { 
        driverId: session.userId, 
        packageStatus: "IN_TRANSIT" 
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.socialWallet.findUnique({
      where: { userId: session.userId },
      select: { balance: true },
    })
  ]);

  const socialBalance = wallet?.balance ?? 0;

  // 🚨 KOLISYNC TRUST ENGINE : Protection du Livreur
  // On extrait les numéros des clients en cours de livraison
  const displayedPhones = [...new Set(deliveries.map(o => o.customerPhone))];
  const riskProfiles = await prisma.customerRisk.findMany({
    where: { 
      customerPhone: { in: displayedPhones },
      reportCount: { gte: 2 } 
    },
    select: { customerPhone: true, reportCount: true }
  });
  const riskMap = new Map(riskProfiles.map(r => [r.customerPhone, r.reportCount]));

  return (
    <div className="p-4 space-y-8 bg-slate-50 min-h-screen pb-24 font-sans">
      
      {/* ── HEADER PWA ── */}
      <header className="pt-2 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
            Ma Tournée
          </h1>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-bold text-emerald-600 tracking-wide uppercase">
              En ligne & Prêt
            </span>
          </div>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 text-slate-900">
            <Package className="h-7 w-7" />
        </div>
      </header>

      {/* ── WIDGET PROTECTION SOCIALE (Premium Card) ── */}
      <Link 
        href="/pwa/wallet" 
        className="block relative overflow-hidden rounded-[2rem] bg-slate-900 p-6 text-white shadow-xl transition-transform active:scale-[0.98] hover:shadow-2xl cursor-pointer"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl" />
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2">
              <TrendingUp className="h-4 w-4" />
              SocialWallet
            </div>
            <p className="text-3xl font-black tracking-tight drop-shadow-sm">
              {formatFCFA(socialBalance)}
            </p>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest pt-1">
              Fonds de garantie
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-white/10 text-white backdrop-blur-md ring-1 ring-white/20">
            <ChevronRight className="h-6 w-6" />
          </div>
        </div>
      </Link>

      {/* ── LE RADAR D'OPPORTUNITÉS (Bourse Publique) ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
            <Radar className="h-4 w-4 animate-spin-slow" />
            Radar de courses
          </h2>
        </div>
        
        <AvailableOrdersList />
      </section>

      {/* ── SECTION : À RÉCUPÉRER (Chez le commerçant) ── */}
      {pickups.length > 0 && (
        <section className="space-y-4 pt-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2">
            <Store className="h-4 w-4" />
            À récupérer ({pickups.length})
          </h2>
          
          <div className="space-y-4">
            {pickups.map((order) => (
              <Link key={order.id} href={`/pwa/packages/${order.id}`} className="block">
                <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-2 ring-blue-400 overflow-hidden relative transition-transform active:scale-[0.98]">
                  <div className="absolute top-0 right-0 bg-blue-400 text-blue-950 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                    Go Pick-up
                  </div>

                  <div className="flex justify-between items-start mb-4 mt-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-blue-50 text-blue-600">
                        <Store className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-lg leading-tight">{order.tenant.name}</p>
                        <p className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                          Boutique B2B
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                      <MapPin className="h-4 w-4" /> {order.commune}
                    </div>
                    <ChevronRight className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── SECTION : EN COURS DE LIVRAISON (Vers le client) ── */}
      <section className="space-y-4 pt-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2">
          <Navigation className="h-4 w-4" />
          En transit ({deliveries.length})
        </h2>

        {deliveries.length === 0 && pickups.length === 0 ? (
          <div className="rounded-[2.5rem] bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-slate-50 text-slate-300 ring-1 ring-slate-100">
              <Package className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Votre coffre est vide</h3>
            <p className="mt-1 text-sm text-slate-500 font-medium">Acceptez une course via le Radar pour commencer la journée.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((order) => {
              // 🚨 Récupération du score de risque pour ce colis précis
              const riskCount = riskMap.get(order.customerPhone);
              const isDanger = riskCount && riskCount >= 3;
              const isWarning = riskCount && riskCount === 2;

              return (
                <Link
                  key={order.id}
                  href={`/pwa/packages/${order.id}`}
                  className="block overflow-hidden rounded-[2.5rem] bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md active:scale-[0.98]"
                >
                  <div className="p-5">
                    <div className="mb-5 flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] ${isDanger ? 'bg-red-50 text-red-600 ring-1 ring-red-100' : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'}`}>
                          <Package className="h-7 w-7" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-black text-slate-900 leading-tight">{order.customerName}</p>
                            {isDanger && (
                              <span className="flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-red-700 ring-1 ring-red-200 shadow-sm">
                                <ShieldAlert className="h-3 w-3" /> Fraude
                              </span>
                            )}
                            {isWarning && (
                              <span className="flex items-center gap-1 rounded bg-orange-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-orange-700 ring-1 ring-orange-200 shadow-sm">
                                <AlertTriangle className="h-3 w-3" /> Suspect
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">
                            ID: <span className="text-slate-600">{order.id.slice(-6).toUpperCase()}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-[1.5rem] bg-slate-50 p-5 text-sm ring-1 ring-slate-100">
                      <div className="flex items-center gap-4 text-slate-700">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 shadow-sm">
                          <Phone className="h-4 w-4 text-slate-500" />
                        </div>
                        <span className="font-black text-lg tracking-wide">{order.customerPhone}</span>
                      </div>
                      {order.deliveryAddress && (
                        <div className="flex items-start gap-4 text-slate-600">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 shadow-sm mt-0.5">
                            <MapPin className="h-4 w-4 text-slate-500" />
                          </div>
                          <span className="line-clamp-2 leading-snug font-semibold pt-1">{order.deliveryAddress}</span>
                        </div>
                      )}
                    </div>

                    {/* BANNIÈRE D'ALERTE POUR LE LIVREUR */}
                    {isDanger && (
                      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-red-50 p-4 ring-1 ring-red-200 border border-red-100 shadow-inner">
                        <ShieldAlert className="h-5 w-5 shrink-0 text-red-600" />
                        <p className="text-[11px] font-bold text-red-900 leading-relaxed">
                          <span className="uppercase tracking-wider block mb-1">Vigilance Absolue</span>
                          Ce client a de multiples litiges réseau. Exigez le paiement ou le code PIN avant de remettre physiquement le colis.
                        </p>
                      </div>
                    )}

                    <div className="mt-5 flex items-center justify-between pt-1 px-1">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cash à collecter</p>
                        <p className="text-2xl font-black text-slate-900">{formatFCFA(order.amountDue)}</p>
                      </div>
                      <div className={`flex h-14 w-14 items-center justify-center rounded-[1.25rem] shadow-lg transition-colors ${isDanger ? 'bg-red-600 shadow-red-600/20' : 'bg-slate-900 shadow-slate-900/20'} text-white`}>
                        <ChevronRight className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
