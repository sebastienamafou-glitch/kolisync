import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, ArrowLeft, Wallet } from "lucide-react";
import prismaAdmin from "@/lib/prisma-admin";
import { getSession } from "@/lib/session";
import { updateDriverCashLimitAction } from "@/app/actions/admin"; // 🚨 NOUVEL IMPORT

export default async function AdminDriversPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/");

  const drivers = await prismaAdmin.user.findMany({
    where: { role: "DRIVER" },
    include: {
      tenant: { select: { name: true } },
      driverOrders: {
        where: { cashStatus: "HELD_BY_DRIVER" },
        select: { amountDue: true }
      }
    }
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12 pb-24">
      <header className="mb-10 flex items-center gap-4">
        <Link href="/admin" className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-black flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-500" /> Supervision Livreurs
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {drivers.map((d) => {
          const currentCash = d.driverOrders.reduce((sum, o) => sum + o.amountDue, 0);
          const usagePercent = Math.min(Math.round((currentCash / d.maxCashLimit) * 100), 100);

          return (
            <div key={d.id} className="bg-slate-900 rounded-[2.5rem] p-8 ring-1 ring-slate-800 flex flex-col justify-between">
              
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-black">
                      {d.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-lg">{d.name}</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{d.tenant.name}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-full ring-1 ring-slate-800">
                    {d.phone}
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-end text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Wallet className="h-4 w-4" /> Cash actuel
                    </div>
                    <span className={`font-black ${usagePercent > 80 ? "text-orange-500" : "text-white"}`}>
                      {new Intl.NumberFormat('fr-FR').format(currentCash)} F / {new Intl.NumberFormat('fr-FR').format(d.maxCashLimit)} F
                    </span>
                  </div>
                  
                  {/* Barre de progression du plafond */}
                  <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden ring-1 ring-slate-800">
                    <div 
                      className={`h-full transition-all duration-500 ${usagePercent > 90 ? "bg-red-500" : usagePercent > 70 ? "bg-orange-500" : "bg-blue-600"}`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 🚨 LE FORMULAIRE INTERACTIF POUR AJUSTER LE PLAFOND */}
              <form action={updateDriverCashLimitAction} className="pt-5 border-t border-slate-800/50 flex gap-2">
                <input type="hidden" name="driverId" value={d.id} />
                <input 
                  type="number" 
                  name="newLimit" 
                  defaultValue={d.maxCashLimit}
                  className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Nouveau plafond"
                  min="0"
                  step="5000"
                  required
                />
                <button type="submit" className="flex-1 py-3 rounded-xl bg-slate-800 text-xs font-black hover:bg-slate-700 transition-colors text-white tracking-widest uppercase">
                  Ajuster
                </button>
              </form>

            </div>
          );
        })}
      </div>
    </div>
  );
}
