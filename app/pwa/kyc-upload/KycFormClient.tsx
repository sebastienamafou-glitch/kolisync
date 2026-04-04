"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { Camera, FileText, ChevronLeft, Loader2, ShieldCheck, CreditCard, FileBadge, Phone, Hash, AlertTriangle } from "lucide-react";
import { submitKycAction } from "@/app/actions/kyc-driver";

interface KycFormClientProps {
  kycStatus: string;
  rejectionReason: string | null;
}

export default function KycFormClient({ kycStatus, rejectionReason }: KycFormClientProps) {
  const [state, formAction] = useActionState(submitKycAction, null);
  
  const [idFileName, setIdFileName] = useState<string | null>(null);
  const [selfieFileName, setSelfieFileName] = useState<string | null>(null);
  const [licenseFileName, setLicenseFileName] = useState<string | null>(null);
  const [registrationFileName, setRegistrationFileName] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-cyan-500/20 px-6 py-8 relative overflow-hidden">
      
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: "radial-gradient(circle at 50% -20%, rgba(6,182,212,0.15) 0%, transparent 60%)" }} />

      <header className="relative z-10 flex items-center gap-4 mb-10">
        <Link href="/pwa" className="p-2 -ml-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors">
          <ChevronLeft className="h-5 w-5 text-cyan-400" />
        </Link>
        <h1 className="text-xl font-black text-white tracking-tight">Dossier de Conformité</h1>
      </header>

      {/* 🚨 AFFICHAGE DU MOTIF DE REFUS */}
      {kycStatus === "REJECTED" && rejectionReason && (
        <div className="relative z-10 mb-6 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-1">Dossier refusé</h3>
            <p className="text-sm text-red-200 leading-relaxed">{rejectionReason}</p>
            <p className="text-[10px] text-red-400/80 mt-2 font-bold uppercase tracking-widest">Veuillez soumettre à nouveau vos documents.</p>
          </div>
        </div>
      )}

      {/* ⚠️ MESSAGE D'ATTENTE */}
      {kycStatus === "PENDING" && !isSubmitting && (
        <div className="relative z-10 mb-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <Loader2 className="h-6 w-6 text-amber-500 shrink-0 mt-0.5 animate-spin" />
          <div>
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-1">En cours d'analyse</h3>
            <p className="text-xs text-amber-200/80 leading-relaxed">Votre dossier est en cours de vérification par KoliSync HQ. Cette étape peut prendre quelques heures.</p>
          </div>
        </div>
      )}

      <form 
        action={formAction} 
        onSubmit={() => setIsSubmitting(true)}
        className="relative z-10 space-y-6"
      >
        {state?.error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold animate-in fade-in slide-in-from-top-2">
            {state.error}
          </div>
        )}

        <div className="space-y-4">
          
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">1. Informations de Sécurité</h2>
            
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input 
                type="text" 
                name="emergencyContact" 
                required 
                placeholder="Contact d'urgence (ex: Mère 07...)" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>

            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input 
                type="text" 
                name="licensePlate" 
                required 
                placeholder="Plaque d'immatriculation moto" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors uppercase"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1 mt-6">2. Documents Requis</h2>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 relative overflow-hidden group focus-within:border-cyan-500/50 transition-colors">
              <input 
                type="file" name="idDocument" accept="image/*" capture="environment" required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => setIdFileName(e.target.files?.[0]?.name || null)}
              />
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${idFileName ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-cyan-400'}`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">Pièce d&apos;identité</p>
                  <p className="text-xs font-medium text-slate-400 line-clamp-1">{idFileName || "CNI ou Passeport"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 relative overflow-hidden group focus-within:border-cyan-500/50 transition-colors">
              <input 
                type="file" name="selfie" accept="image/*" capture="user" required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => setSelfieFileName(e.target.files?.[0]?.name || null)}
              />
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${selfieFileName ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-amber-400'}`}>
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">Selfie de contrôle</p>
                  <p className="text-xs font-medium text-slate-400 line-clamp-1">{selfieFileName || "Visage dégagé"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 relative overflow-hidden group focus-within:border-cyan-500/50 transition-colors">
              <input 
                type="file" name="drivingLicense" accept="image/*" capture="environment" required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => setLicenseFileName(e.target.files?.[0]?.name || null)}
              />
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${licenseFileName ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-indigo-400'}`}>
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">Permis de conduire</p>
                  <p className="text-xs font-medium text-slate-400 line-clamp-1">{licenseFileName || "Photo nette du permis"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 relative overflow-hidden group focus-within:border-cyan-500/50 transition-colors">
              <input 
                type="file" name="vehicleRegistration" accept="image/*" capture="environment" required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => setRegistrationFileName(e.target.files?.[0]?.name || null)}
              />
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${registrationFileName ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-purple-400'}`}>
                  <FileBadge className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">Carte Grise</p>
                  <p className="text-xs font-medium text-slate-400 line-clamp-1">{registrationFileName || "Certificat d'immatriculation"}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !idFileName || !selfieFileName || !licenseFileName || !registrationFileName}
          className="w-full py-4 mt-8 rounded-xl bg-cyan-500 text-slate-950 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {isSubmitting ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Envoi sécurisé...</>
          ) : (
            <><ShieldCheck className="h-5 w-5" /> Soumettre mon dossier</>
          )}
        </button>

      </form>
    </div>
  );
}
