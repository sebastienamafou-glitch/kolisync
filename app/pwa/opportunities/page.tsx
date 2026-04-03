import Link from "next/link";
import { redirect } from "next/navigation";
import { Globe, MapPin, Banknote, ChevronRight, Search, Clock, ShieldCheck } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function OpportunitiesPage() {
  const session = await getSession();
  
  if (!session || session.role !== "DRIVER") {
    redirect("/");
  }

  // 🚨 Requête Cross-Tenant : On récupère TOUTES les courses publiques.
  const opportunities = await prisma.order.findMany({
    where: { 
      packageStatus: "AVAILABLE_PUBLIC",
      isPublic: true 
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      commune: true,
      amountDue: true,
      depositAmount: true, // 🚨 NOUVEAU : Récupération de la caution
      deliveryFee: true,
      createdAt: true,
    }
  });

  const formatFCFA = (amount: number) => 
    new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="bg-slate-900 px-6 pt-12 pb-8 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Globe className="h-8 w-8 text-blue-400" />
              Bourse Globale
            </h1>
            <p className="text-blue-200 text-sm font-medium mt-2">
              Opportunités en libre-service
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
            <Search className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* LISTE DES OPPORTUNITÉS */}
      <div className="px-4 -mt-4 relative z-20 space-y-4">
        {opportunities.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-10 text-center shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Globe className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Bourse vide</h3>
            <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
              Aucune course n'est disponible pour le moment. Revenez plus tard !
            </p>
          </div>
        ) : (
          opportunities.map((opp) => (
            <Link 
              key={opp.id} 
              href={`/pwa/opportunities/${opp.id}`}
              className="block group"
            >
              <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 transition-all active:scale-[0.98] active:shadow-inner hover:border-blue-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg leading-tight">
                        {opp.commune || "Zone non précisée"}
                      </h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        ID: {opp.id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Gain Net</p>
                    <p className="font-black text-emerald-600 text-lg leading-none">
                      {formatFCFA(opp.deliveryFee)}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1 flex items-center justify-end gap-1">
                      <ShieldCheck className="h-3 w-3 text-amber-500" /> Caution exigée
                    </p>
                    <p className="font-bold text-slate-900 leading-none">
                      {formatFCFA(opp.depositAmount || 0)}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 mt-1.5 flex items-center gap-1">
                      <Banknote className="h-3 w-3" /> COD : {formatFCFA(opp.amountDue)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
