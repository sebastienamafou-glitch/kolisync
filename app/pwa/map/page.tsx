import { redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, Navigation, Compass, Crosshair, Map, CheckCircle2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function PWAMapPage() {
  const session = await getSession();
  if (!session || session.role !== "DRIVER") redirect("/");

  // 🚨 FIX : Filtrage strict par Livreur (Cross-Tenant) et bons statuts
  const orders = await prisma.order.findMany({
    where: {
      driverId: session.userId, 
      packageStatus: { in: ["DISPATCHED", "IN_TRANSIT"] },
    },
    orderBy: { createdAt: "asc" },
  });

  const nextOrder = orders[0]; // La cible prioritaire

  return (
    // Hauteur totale moins la barre de navigation du bas (4rem = 64px)
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-100">
      
      {/* ── Faux fond de carte (Placeholder CSS) ── */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, #cbd5e1 1px, transparent 0)',
        backgroundSize: '24px 24px'
      }} />
      
      {/* ── Interface flottante haut (HUD) ── */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-4 pointer-events-none">
        <div className="flex h-12 items-center gap-2 rounded-full bg-slate-900/90 px-4 text-white shadow-lg backdrop-blur-md">
          <Compass className="h-5 w-5 text-blue-400" />
          <span className="text-sm font-black tracking-widest">EN SERVICE</span>
        </div>
        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full bg-white shadow-lg">
          <span className="text-sm font-black leading-none text-slate-900">{orders.length}</span>
          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Arrêts</span>
        </div>
      </div>

      {/* ── Radar central (Animation) ── */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className="absolute h-32 w-32 animate-ping rounded-full bg-blue-500/20" />
        <div className="absolute h-16 w-16 animate-pulse rounded-full bg-blue-500/40" />
        <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl ring-4 ring-white">
          <Navigation className="h-5 w-5 -rotate-45" />
        </div>
      </div>

      {/* ── Panneau d'action bas (Bottom Sheet) ── */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        {nextOrder ? (
          <div className="rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden flex flex-col">
            <div className="bg-slate-900 p-5 text-white">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                <Crosshair className="h-4 w-4" /> Destination prioritaire
              </div>
              <h2 className="mt-1 text-2xl font-black tracking-tight">{nextOrder.customerName}</h2>
            </div>
            
            <div className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="mt-0.5 h-6 w-6 shrink-0 text-slate-400" />
                <p className="text-base font-semibold leading-snug text-slate-700">
                  {nextOrder.commune} — {nextOrder.deliveryAddress || "Appeler le client pour l'adresse exacte."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                {/* 🚨 NOUVEAU : Bouton GPS (Deep Linking Google Maps) */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${nextOrder.commune}, Abidjan, Côte d'Ivoire`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-blue-50 text-blue-600 px-4 py-4 text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  <Map className="h-5 w-5" />
                  Y Aller (GPS)
                </a>

                {/* Bouton de validation logistique */}
                <Link
                  href={`/pwa/packages/${nextOrder.id}`}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-900 shadow-lg shadow-amber-400/20 transition-all active:scale-95"
                >
                  Livrer colis
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-6 text-center shadow-2xl ring-1 ring-slate-200">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="text-lg font-black text-slate-900 tracking-tight">Zone dégagée</p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Aucune course en attente. Reposez-vous ou consultez le radar public.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
