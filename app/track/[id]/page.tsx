import { 
  Package, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Banknote, 
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  SearchX,
  Map // 🚨 NOUVEL IMPORT : L'icône de carte
} from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  // On attend la résolution de la promesse Next.js (La correction précédente)
  const resolvedParams = await params;
  const trackingId = resolvedParams.id;

  const order = await prisma.order.findFirst({
    where: { 
      id: {
        endsWith: trackingId.toLowerCase()
      }
    },
    select: {
      id: true,
      customerName: true,
      commune: true,
      amountDue: true,
      packageStatus: true,
      updatedAt: true,
      tenant: { select: { name: true } },
      driver: { select: { name: true, phone: true } }
    }
  });

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl text-center max-w-sm w-full ring-1 ring-slate-100">
          <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <SearchX className="h-8 w-8 text-slate-400" />
          </div>
          <h1 className="text-xl font-black text-slate-900 mb-2">Colis introuvable</h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Le numéro de suivi <strong className="text-slate-900">{trackingId}</strong> n'existe pas ou est erroné.
          </p>
        </div>
      </div>
    );
  }

  const formatFCFA = (amount: number) => 
    new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";

  const driverFirstName = order.driver?.name.split(" ")[0] || "Un livreur certifié";

  const isPending = ["PENDING", "AVAILABLE_PUBLIC"].includes(order.packageStatus);
  const isInTransit = ["DISPATCHED", "IN_TRANSIT"].includes(order.packageStatus);
  const isDelivered = ["DELIVERED_VERIFIED", "DELIVERED_UNSECURED"].includes(order.packageStatus);
  const isFailed = ["FAILED_RETURNED", "CONFLICT"].includes(order.packageStatus);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 mt-4 sm:mt-10 relative">
        
        <div className="bg-slate-900 p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            Suivi de colis KoliSync
          </p>
          <h1 className="text-xl font-black text-white truncate">
            {order.tenant.name}
          </h1>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          
          <div className="relative pl-4 border-l-2 border-slate-100 space-y-8">
            <div className="relative">
              <div className="absolute -left-[25px] top-0 h-6 w-6 rounded-full bg-emerald-500 ring-4 ring-white flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </div>
              <p className="text-sm font-bold text-slate-900">Colis enregistré</p>
              <p className="text-xs text-slate-500">Par {order.tenant.name}</p>
            </div>

            <div className="relative">
              <div className={`absolute -left-[25px] top-0 h-6 w-6 rounded-full ring-4 ring-white flex items-center justify-center transition-colors ${
                isInTransit || isDelivered ? "bg-emerald-500" : 
                isPending ? "bg-amber-400" : "bg-slate-200"
              }`}>
                {isInTransit || isDelivered ? <CheckCircle2 className="h-3 w-3 text-white" /> : <Package className="h-3 w-3 text-white" />}
              </div>
              <p className={`text-sm font-bold ${isInTransit ? "text-amber-600" : "text-slate-900"}`}>
                {isPending ? "Recherche de livreur..." : "En cours de livraison"}
              </p>
              {isInTransit && order.driver && (
                <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                  <div className="bg-amber-200/50 p-2 rounded-full shrink-0">
                    <Truck className="h-4 w-4 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-900">Confiez le colis à {driverFirstName}</p>
                    <p className="text-[10px] text-amber-700 mt-0.5">Livreur vérifié par KoliSync</p>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <div className={`absolute -left-[25px] top-0 h-6 w-6 rounded-full ring-4 ring-white flex items-center justify-center ${
                isDelivered ? "bg-emerald-500" : 
                isFailed ? "bg-red-500" : "bg-slate-200"
              }`}>
                {isDelivered ? <CheckCircle2 className="h-3 w-3 text-white" /> : 
                 isFailed ? <AlertTriangle className="h-3 w-3 text-white" /> : 
                 <MapPin className="h-3 w-3 text-white" />}
              </div>
              <p className={`text-sm font-bold ${
                isDelivered ? "text-emerald-600" : 
                isFailed ? "text-red-600" : "text-slate-400"
              }`}>
                {isDelivered ? "Livraison validée" : 
                 isFailed ? "Problème de livraison" : "Livraison finale"}
              </p>
            </div>
          </div>

          {/* 🚨 NOUVEAU : CARTE DE TRACKING VISUELLE 🚨 */}
          <div className="relative h-48 w-full rounded-2xl overflow-hidden ring-1 ring-slate-200 bg-slate-100">
            {order.commune ? (
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(order.commune + ", Côte d'Ivoire")}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                className="absolute inset-0 z-0 grayscale-[30%] opacity-90"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Map className="h-8 w-8 text-slate-300" />
              </div>
            )}

            {/* Voile d'ombre pour le style */}
            <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.05)]" />

            {/* Radar Clignotant (Uniquement quand c'est en route) */}
            {isInTransit && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <span className="relative flex h-6 w-6">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-6 w-6 bg-blue-600 border-2 border-white shadow-md"></span>
                </span>
              </div>
            )}

            {/* Bulle d'info */}
            <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-sm ring-1 ring-slate-900/5">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 truncate">
                {isInTransit ? `En approche : ${order.commune}` : `Zone : ${order.commune || "Non précisée"}`}
              </p>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5 mb-1">
                <Banknote className="h-3 w-3" /> À payer à la livraison
              </p>
              <p className="text-lg font-black text-slate-900">{formatFCFA(order.amountDue)}</p>
            </div>
            <ShieldCheck className="h-8 w-8 text-slate-200" />
          </div>

          {!isDelivered && !isFailed && (
             <p className="text-[10px] font-medium text-slate-400 text-center flex items-center justify-center gap-1.5">
               <RefreshCw className="h-3 w-3 animate-spin-slow" /> Rafraîchissez la page pour suivre l'évolution
             </p>
          )}

        </div>
      </div>
    </div>
  );
}
