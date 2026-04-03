import { redirect } from "next/navigation";
import { Building2, Mail, Phone, ShieldCheck, Users, Package } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { AddDriverForm } from "@/features/marketplace/AddDriverForm";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/");

  // 1. Récupération des données du Tenant et du compte actuel
  const [tenant, currentUser, drivers] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: session.tenantId } }),
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.user.findMany({
      where: { tenantId: session.tenantId, role: "DRIVER" },
      include: {
        _count: {
          select: {
            // Compte uniquement les colis non terminés assignés à ce livreur
            driverOrders: {
              where: { packageStatus: { in: ["PENDING", "IN_TRANSIT"] } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!tenant || !currentUser) redirect("/");

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Paramètres de l'espace</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gérez les informations de votre entreprise et votre flotte de coursiers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* ── Colonne Gauche : Profil & Entreprise ── */}
        <div className="space-y-8 lg:col-span-1">
          
          {/* Carte Entreprise */}
          <div className="overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-amber-400">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Entreprise</h2>
            <p className="mt-1 text-2xl font-black tracking-tight">{tenant.name}</p>
            <p className="mt-4 text-xs font-medium text-slate-500">
              ID: {tenant.id.split("-")[0].toUpperCase()}
            </p>
          </div>

          {/* Carte Profil Admin */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">Mon Profil</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-xs font-semibold text-amber-600">Administrateur</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" />
                {currentUser.phone}
              </div>
              {currentUser.email && (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {currentUser.email}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Colonne Droite : Flotte (Liste + Ajout) ── */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            
            {/* Formulaire d'ajout (composant isolé) */}
            <div className="w-full md:w-1/2">
              <AddDriverForm />
            </div>

            {/* Liste des livreurs actuels */}
            <div className="w-full md:w-1/2">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-slate-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Flotte active ({drivers.length})</h3>
              </div>

              <div className="space-y-3">
                {drivers.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    Aucun livreur dans votre flotte.
                  </div>
                ) : (
                  drivers.map((driver) => (
                    <div key={driver.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{driver.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{driver.phone}</p>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        <Package className="h-3.5 w-3.5" />
                        {driver._count.driverOrders} en cours
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
