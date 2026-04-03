import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Globe, MapPin, Banknote, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { claimOpportunityAction } from "@/app/actions/marketplace";

export async function GlobalMarketplace() {
  const session = await getSession();
  if (!session) return null;

  // On récupère les colis publics qui n'ont pas encore de livreur
  // Le middleware Prisma s'occupe d'autoriser le cross-tenant via OR { isPublic: true }
  const opportunities = await prisma.order.findMany({
    where: {
      isPublic: true,
      driverId: null,
      packageStatus: "PENDING",
      // On exclut les colis de son propre tenant car ils sont déjà dans "Invitations"
      NOT: { tenantId: session.tenantId }
    },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  if (opportunities.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 animate-pulse" />
          Bourse Globale ({opportunities.length})
        </h2>
        <Link 
          href="/pwa/opportunities" 
          className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter"
        >
          Voir tout
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
        {opportunities.map((order) => (
          <div 
            key={order.id} 
            className="min-w-[280px] rounded-[2rem] bg-emerald-50/50 p-5 ring-1 ring-emerald-100 relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-1">
                {/* Data Masking : Identité cachée avant acceptation */}
                <p className="font-black text-slate-900 leading-none">Client : *******</p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                  <MapPin className="h-3 w-3" />
                  {order.deliveryAddress?.split(',')[0] || "Zone Abidjan"}
                </div>
              </div>
              <div className="bg-white px-3 py-1 rounded-full shadow-sm">
                <p className="text-[10px] font-black text-emerald-700">
                  +{new Intl.NumberFormat("fr-FR").format(order.deliveryFee)} FCFA
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2 text-slate-500">
                <Banknote className="h-4 w-4" />
                <span className="text-xs font-bold">
                  COD: {new Intl.NumberFormat("fr-FR").format(order.amountDue)} F
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Lien vers les détails pour analyse complète avant action */}
                <Link 
                  href={`/pwa/opportunities/${order.id}`}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 border border-slate-200 active:scale-90 transition-transform"
                >
                  <ArrowRight className="h-5 w-5" />
                </Link>

                {/* Bouton d'acceptation rapide (Quick Claim) */}
                <form action={async () => { 
                  "use server"; 
                  await claimOpportunityAction(order.id); 
                }}>
                  <button 
                    type="submit"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 active:scale-90 transition-transform"
                  >
                    <Zap className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
