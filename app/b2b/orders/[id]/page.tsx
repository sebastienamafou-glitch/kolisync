import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  Package, 
  MapPin, 
  User, 
  Calendar, 
  ShieldCheck
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { OrderTimeline } from "@/components/OrderTimeline";

export default async function B2BOrderDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session || session.role !== "OWNER") redirect("/");

  const order = await prisma.order.findUnique({
    where: { 
      id,
      tenantId: session.tenantId 
    },
    include: {
      events: { // ✅ Corrigé : events au lieu de packageEvents
        orderBy: { logicalTs: "desc" },
        include: { author: { select: { name: true } } }
      }
    }
  });

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-24 font-sans animate-in fade-in duration-500">
      
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/b2b" 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Colis #{order.id.slice(-6).toUpperCase()}
            </h1>
            <p className="text-sm font-medium text-slate-500">Suivi et traçabilité GPS</p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 border border-blue-100">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-black text-blue-700 uppercase tracking-widest">Sécurisé par PIN</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── COLONNE GAUCHE : INFOS CLIENT & LIVRAISON ── */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Package className="h-4 w-4" /> Détails de l&apos;expédition
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase">Destinataire</p>
                    <p className="font-bold text-slate-900">{order.customerPhone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase">Adresse de livraison</p>
                    <p className="font-bold text-slate-900">{order.commune}, {order.deliveryAddress || "Non précisée"}</p> {/* ✅ Corrigé : deliveryAddress */}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase">Date de création</p>
                    <p className="font-bold text-slate-900">
                      {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-[10px] mt-0.5">
                    C
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase">Montant à collecter</p>
                    <p className="text-xl font-black text-emerald-600">
                      {new Intl.NumberFormat('fr-FR').format(order.amountDue)} FCFA {/* ✅ Corrigé : amountDue */}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── LA TIMELINE GPS ── */}
          <section className="rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Historique de traçabilité
            </h2>
            {/* Adaptation des données schema vers les props du composant */}
            <OrderTimeline events={order.events.map(e => ({
              ...e,
              status: e.toStatus 
            }))} /> 
          </section>
        </div>

        {/* ── COLONNE DROITE : RÉSUMÉ & ACTIONS ── */}
        <div className="space-y-6">
          <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />
            
            <h3 className="relative z-10 text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Statut Actuel</h3>
            <p className="relative z-10 text-2xl font-black mb-6">{order.packageStatus}</p> {/* ✅ Corrigé : packageStatus */}
            
            <div className="relative z-10 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold">Livreur assigné</span>
                <span className="font-black">Agent ID: {order.driverId?.slice(-4) || "N/A"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold">État du cash</span>
                <span className="font-black text-amber-400">{order.cashStatus}</span>
              </div>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 p-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            Signaler un litige
          </button>
        </div>

      </div>
    </div>
  );
}
