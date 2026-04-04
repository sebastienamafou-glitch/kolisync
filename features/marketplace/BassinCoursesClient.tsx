"use client";

import { useState, useTransition } from "react";
import { MapPin, Package, Navigation, CheckCircle, Loader2, Info } from "lucide-react";
// 🚨 CORRECTION : Importation de la bonne action depuis le module marketplace
import { claimOpportunityAction } from "@/app/actions/marketplace";

interface Order {
  id: string;
  customerName: string;
  deliveryAddress: string | null;
  commune: string | null;
  amountDue: number;
  deliveryFee: number;
}

export function BassinCoursesClient({ 
  initialOrders, 
  preferredZone 
}: { 
  initialOrders: Order[]; 
  preferredZone: string | null;
}) {
  const [showOnlyMyZone, setShowOnlyMyZone] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Filtrage géographique selon les doléances des livreurs
  const filteredOrders = showOnlyMyZone && preferredZone
    ? initialOrders.filter(o => o.commune === preferredZone)
    : initialOrders;

  const handleClaim = async (orderId: string) => {
    setError(null);
    startTransition(async () => {
      // 🚨 CORRECTION : Appel de la fonction claimOpportunityAction
      const result = await claimOpportunityAction(orderId);
      if (result?.error) {
        setError(result.error);
        // On remonte en haut pour voir l'erreur
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Sélecteur de Zone */}
      <div className="flex items-center justify-between gap-4 rounded-3xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
        <button
          onClick={() => setShowOnlyMyZone(true)}
          className={`flex-1 rounded-2xl py-3 text-xs font-black uppercase tracking-widest transition-all ${
            showOnlyMyZone 
              ? "bg-slate-900 text-white shadow-lg" 
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Ma Zone ({preferredZone || "N/A"})
        </button>
        <button
          onClick={() => setShowOnlyMyZone(false)}
          className={`flex-1 rounded-2xl py-3 text-xs font-black uppercase tracking-widest transition-all ${
            !showOnlyMyZone 
              ? "bg-slate-900 text-white shadow-lg" 
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Toutes Zones
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600 ring-1 ring-red-200 animate-in shake">
          <Info className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Liste des Annonces */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Navigation className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Aucune course disponible {showOnlyMyZone ? "dans votre zone" : ""}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="overflow-hidden rounded-[2.5rem] bg-white shadow-sm ring-1 ring-slate-200">
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
                      <Package className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 leading-none">{order.customerName}</p>
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <MapPin className="h-3 w-3" />
                        {order.commune || "Abidjan"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Votre gain</p>
                    <p className="text-xl font-black text-emerald-600">
                      +{new Intl.NumberFormat("fr-FR").format(order.deliveryFee)} F
                    </p>
                  </div>
                </div>

                <div className="mb-6 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Total à collecter</span>
                    <span className="font-black text-slate-900">{new Intl.NumberFormat("fr-FR").format(order.amountDue)} FCFA</span>
                  </div>
                  <p className="mt-2 line-clamp-1 text-xs font-medium text-slate-400">
                    📍 {order.deliveryAddress || "Adresse non précisée"}
                  </p>
                </div>

                <button
                  onClick={() => handleClaim(order.id)}
                  disabled={isPending}
                  className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-slate-900 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-slate-900/10 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Prendre la course
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
