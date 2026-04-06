import { 
  Package, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Banknote, 
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  SearchX
} from "lucide-react";
import prisma from "@/lib/prisma";

// On force la page à se re-rendre sur le serveur
export const dynamic = "force-dynamic";

export default async function TrackingPage({ params }: { params: { id: string } }) {
  // Récupération de l'ID passé dans l'URL (ex: VEOVMX)
  const trackingId = params.id;

  // 🚨 CORRECTION : On cherche la commande dont l'ID *se termine* par le trackingId (en minuscules)
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

  // 🚨 CORRECTION UX : Au lieu de faire crasher la page, on affiche un message propre
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

  // Extraction du prénom du livreur uniquement (Privacy)
  const driverFirstName = order.driver?.name.split(" ")[0] || "Un livreur certifié";

  // Mapping des statuts (KISS Timeline)
  const isPending = ["PENDING", "AVAILABLE_PUBLIC"].includes(order.packageStatus);
  const isInTransit = ["DISPATCHED", "IN_TRANSIT"].includes(order.packageStatus);
  const isDelivered = ["DELIVERED_VERIFIED", "DELIVERED_UNSECURED"].includes(order.packageStatus);
  const isFailed = ["FAILED_RETURNED", "CONFLICT"].includes(order.packageStatus);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 font-sans">
      
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 mt-4 sm:mt-10 relative">
        
        {/* Header Marque */}
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
          
          {/* Timeline Visuelle */}
          <div className="relative pl-4 border-l-2 border-slate-100 space-y-8">
            
            {/* Étape 1 : Préparation */}
            <div className="relative">
              <div className="absolute -left-[25px] top-0 h-6 w-6 rounded-full bg-emerald-500 ring-4 ring-white flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </div>
              <p className="text-sm font-bold text-slate-900">Colis enregistré</p>
              <p className="text-xs text-slate-500">Par {order.tenant.name}</p>
            </div>

            {/* Étape 2 : Transit */}
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

            {/* Étape 3 : Livraison */}
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

          <hr className="border-slate-100" />

          {/* Informations Financières */}
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
