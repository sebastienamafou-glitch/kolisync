import { redirect } from "next/navigation";
import Link from "next/link";
import { Store as StoreLucide, ShieldCheck, Calendar, ArrowLeft } from "lucide-react";
import prismaAdmin from "@/lib/prisma-admin";
import { getSession } from "@/lib/session";
import { toggleTenantProAction } from "@/app/actions/admin"; // 🚨 NOUVEL IMPORT

export default async function AdminTenantsPage() {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") redirect("/");

  const tenants = await prismaAdmin.tenant.findMany({
    include: { _count: { select: { users: true, orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12 pb-24">
      <header className="mb-10 flex items-center gap-4">
        <Link href="/admin" className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-black flex items-center gap-3">
          <StoreLucide className="h-8 w-8 text-blue-500" /> Gestion des Boutiques
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {tenants.map((t) => {
          // 🚨 PRÉPARATION DE L'ACTION AVEC SES ARGUMENTS EXACTS
          const toggleAction = toggleTenantProAction.bind(null, t.id, t.isPro);

          return (
            <div key={t.id} className="bg-slate-900 rounded-3xl p-6 ring-1 ring-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                  <StoreLucide className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2">
                    {t.name}
                    {t.isPro && <ShieldCheck className="h-5 w-5 text-emerald-500" />}
                  </h2>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" /> Inscrit le {t.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Commandes</p>
                  <p className="text-xl font-black">{t._count.orders}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Membres</p>
                  <p className="text-xl font-black">{t._count.users}</p>
                </div>
                
                {/* 🚨 LE FORMULAIRE QUI DÉCLENCHE LE BASCULEMENT */}
                <form action={toggleAction}>
                  <button type="submit" className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${t.isPro ? "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/50 hover:bg-emerald-500/20" : "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"}`}>
                    {t.isPro ? "PRO ACTIF" : "PASSER PRO"}
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
