import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, User, Package, MessageCircle } from "lucide-react";
import prismaAdmin from "@/lib/prisma-admin";
import { getSession } from "@/lib/session";
import { resolveDisputeAction } from "@/app/actions/admin";

export default async function AdminDisputesPage() {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") redirect("/");

  const disputes = await prismaAdmin.dispute.findMany({
    include: {
      driver: { select: { name: true, phone: true } },
      order: { select: { id: true, customerName: true, amountDue: true, tenant: { select: { name: true } } } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12 pb-24">
      <header className="mb-10 flex items-center gap-4">
        <Link href="/admin" className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-black flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-orange-500" /> Arbitrage Litiges
        </h1>
      </header>

      <div className="space-y-6">
        {disputes.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-900 rounded-[2.5rem] ring-1 ring-slate-800">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="font-bold">Aucun litige en cours.</p>
            <p className="text-sm">La plateforme est parfaitement synchronisée.</p>
          </div>
        ) : (
          disputes.map((dis) => (
            <div key={dis.id} className="bg-slate-900 rounded-[2.5rem] overflow-hidden ring-1 ring-slate-800">
              <div className="bg-orange-500/10 p-6 flex justify-between items-center border-b border-orange-500/20">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-black uppercase tracking-widest text-orange-500">Motif : {dis.reason}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{dis.createdAt.toLocaleString('fr-FR')}</span>
              </div>

              <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                    <Package className="h-3 w-3" /> Commande & Boutique
                  </p>
                  <p className="text-white font-bold">{dis.order.tenant.name}</p>
                  <p className="text-xs text-slate-400">ID: #{dis.order.id.slice(-6).toUpperCase()}</p>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                    <User className="h-3 w-3" /> Livreur impliqué
                  </p>
                  <p className="text-white font-bold">{dis.driver.name}</p>
                  <p className="text-xs text-slate-400">{dis.driver.phone}</p>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                    <MessageCircle className="h-3 w-3" /> Témoignage
                  </p>
                  <p className="text-sm italic text-slate-300 leading-relaxed">"{dis.driverComment}"</p>
                </div>
              </div>

              <div className="p-6 bg-slate-950 flex flex-col sm:flex-row gap-3">
                {/* 🚨 Bouton VALIDER (Arbitrage en faveur de la validation) */}
                <form action={resolveDisputeAction} className="flex-1">
                  <input type="hidden" name="disputeId" value={dis.id} />
                  <input type="hidden" name="orderId" value={dis.order.id} />
                  <input type="hidden" name="decision" value="VALIDATE" />
                  <button type="submit" className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-colors active:scale-[0.98]">
                    VALIDER LIVRAISON (Arbitrage)
                  </button>
                </form>

                {/* 🚨 Bouton ANNULER (Arbitrage en faveur de l'annulation) */}
                <form action={resolveDisputeAction} className="flex-1">
                  <input type="hidden" name="disputeId" value={dis.id} />
                  <input type="hidden" name="orderId" value={dis.order.id} />
                  <input type="hidden" name="decision" value="CANCEL" />
                  <button type="submit" className="w-full py-3.5 rounded-2xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-500 transition-colors active:scale-[0.98]">
                    ANNULER COMMANDE
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
