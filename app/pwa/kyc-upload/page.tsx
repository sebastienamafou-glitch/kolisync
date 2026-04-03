"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { Camera, FileText, ChevronLeft, Loader2, ShieldCheck } from "lucide-react";
import { submitKycAction } from "@/app/actions/kyc-driver";

export default function KycUploadPage() {
  const [state, formAction] = useActionState(submitKycAction, null);
  const [idFileName, setIdFileName] = useState<string | null>(null);
  const [selfieFileName, setSelfieFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-cyan-500/20 px-6 py-8 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: "radial-gradient(circle at 50% -20%, rgba(6,182,212,0.15) 0%, transparent 60%)" }} />

      <header className="relative z-10 flex items-center gap-4 mb-10">
        <Link href="/pwa" className="p-2 -ml-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors">
          <ChevronLeft className="h-5 w-5 text-cyan-400" />
        </Link>
        <h1 className="text-xl font-black text-white tracking-tight">Vérification d&apos;identité</h1>
      </header>

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
          {/* Pièce d'identité */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 relative overflow-hidden group focus-within:border-cyan-500/50 transition-colors">
            <input 
              type="file" 
              name="idDocument" 
              id="idDocument"
              accept="image/*"
              capture="environment"
              required
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => setIdFileName(e.target.files?.[0]?.name || null)}
            />
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${idFileName ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-cyan-400'}`}>
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">Pièce d&apos;identité</p>
                <p className="text-xs font-medium text-slate-400 line-clamp-1">
                  {idFileName ? (
                    <span className="text-emerald-400">{idFileName}</span>
                  ) : (
                    "CNI, Permis ou Passeport"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Selfie */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 relative overflow-hidden group focus-within:border-cyan-500/50 transition-colors">
            <input 
              type="file" 
              name="selfie" 
              id="selfie"
              accept="image/*"
              capture="user"
              required
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => setSelfieFileName(e.target.files?.[0]?.name || null)}
            />
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${selfieFileName ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-amber-400'}`}>
                <Camera className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">Prendre un Selfie</p>
                <p className="text-xs font-medium text-slate-400 line-clamp-1">
                  {selfieFileName ? (
                    <span className="text-emerald-400">{selfieFileName}</span>
                  ) : (
                    "Visage dégagé, sans lunettes"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !idFileName || !selfieFileName}
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
