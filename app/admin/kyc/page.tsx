import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, UserX, FileText, CheckCircle2, XCircle, CreditCard, FileBadge } from "lucide-react";
import prismaAdmin from "@/lib/prisma-admin";
import { getSession } from "@/lib/session";
import { approveKycAction, rejectKycAction } from "@/app/actions/kyc";

export default async function AdminKycPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/");

  const pendingUsers = await prismaAdmin.user.findMany({
    where: { kycStatus: "PENDING" },
    orderBy: { kycSubmittedAt: "asc" },
    select: {
      id: true,
      name: true,
      phone: true,
      role: true,
      kycSubmittedAt: true,
      idDocumentUrl: true,
      selfieUrl: true,
      drivingLicenseUrl: true,
      vehicleRegistrationUrl: true,
      licensePlate: true,
      emergencyContact: true,
      tenant: { select: { name: true } }
    }
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap');
        .f-display { font-family: 'Syne', sans-serif; }
        .f-mono    { font-family: 'JetBrains Mono', monospace; }
        .f-body    { font-family: 'DM Sans', sans-serif; }
        .hq-grid { background-image: linear-gradient(rgba(6,182,212,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,.025) 1px, transparent 1px); background-size: 48px 48px; }
      `}</style>

      <div className="min-h-screen bg-gray-950 text-slate-50 f-body hq-grid selection:bg-cyan-500/20 pb-24">
        
        <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-gray-950/85 backdrop-blur-2xl">
          <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center gap-4">
            <Link href="/admin" className="p-2 -ml-2 rounded-lg hover:bg-slate-800/50 transition-colors">
              <ChevronLeft className="h-5 w-5 text-cyan-500" />
            </Link>
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <h1 className="f-display text-lg font-bold text-white tracking-wide">Vérifications KYC</h1>
          </div>
        </header>

        <main className="max-w-screen-xl mx-auto px-6 pt-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/50 pb-4">
            <p className="f-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Dossiers en attente d'arbitrage ({pendingUsers.length})
            </p>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="rounded-3xl border border-slate-800/50 bg-slate-900/60 p-16 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500/50 mx-auto mb-4" />
              <p className="f-display text-xl text-white">Aucun dossier en attente</p>
              <p className="text-sm text-slate-500 mt-2">Tous les utilisateurs sont à jour.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingUsers.map((user) => (
                <div key={user.id} className="rounded-3xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl flex flex-col">
                  
                  {/* User Info */}
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-lg font-bold text-white leading-tight">{user.name}</h2>
                      <span className="f-mono text-[9px] px-2 py-1 rounded bg-slate-800 text-slate-300 font-bold uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>
                    <p className="f-mono text-[11px] text-cyan-400 mb-1">{user.phone}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">{user.tenant?.name}</p>
                    
                    {/* Nouvelles infos routières */}
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/50 space-y-1 mt-3">
                      <p className="f-mono text-[10px] text-slate-400"><span className="text-slate-500">Plaque:</span> {user.licensePlate || "N/A"}</p>
                      <p className="f-mono text-[10px] text-red-400"><span className="text-slate-500">Urgence:</span> {user.emergencyContact || "N/A"}</p>
                    </div>

                    <p className="f-mono text-[9px] text-slate-600 mt-3">
                      Soumis le: {user.kycSubmittedAt?.toLocaleDateString("fr-FR")}
                    </p>
                  </div>

                  {/* Documents (KISS: Liens directs) */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <a href={user.idDocumentUrl || "#"} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-800/50 bg-slate-950 hover:border-cyan-500/30 transition-colors">
                      <FileText className="h-4 w-4 text-slate-400 mb-1.5" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">CNI</span>
                    </a>
                    <a href={user.selfieUrl || "#"} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-800/50 bg-slate-950 hover:border-cyan-500/30 transition-colors">
                      <UserX className="h-4 w-4 text-slate-400 mb-1.5" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">Selfie</span>
                    </a>
                    <a href={user.drivingLicenseUrl || "#"} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-800/50 bg-slate-950 hover:border-cyan-500/30 transition-colors">
                      <CreditCard className="h-4 w-4 text-indigo-400 mb-1.5" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">Permis</span>
                    </a>
                    <a href={user.vehicleRegistrationUrl || "#"} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-800/50 bg-slate-950 hover:border-cyan-500/30 transition-colors">
                      <FileBadge className="h-4 w-4 text-purple-400 mb-1.5" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">C. Grise</span>
                    </a>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto space-y-3">
                    {/* BOUTON APPROUVER (Restauré) */}
                    <form action={async () => { 
                      "use server"; 
                      await approveKycAction(user.id); 
                    }}>
                      <button className="w-full py-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-colors font-bold text-sm">
                        <CheckCircle2 className="h-4 w-4" /> Approuver
                      </button>
                    </form>

                    {/* BOUTON REFUSER */}
                    <form action={async (formData) => { 
                      "use server"; 
                      await rejectKycAction(formData); 
                    }} className="flex gap-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <input 
                        type="text" 
                        name="reason" 
                        required 
                        placeholder="Raison du refus..." 
                        className="flex-1 bg-slate-950 border border-slate-800/50 rounded-xl px-3 text-[11px] text-white focus:outline-none focus:border-red-500/50"
                      />
                      <button className="px-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center shrink-0">
                        <XCircle className="h-4 w-4" />
                      </button>
                    </form>
                  </div>

                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
