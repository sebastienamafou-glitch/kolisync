"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { 
  Navigation, 
  Phone, 
  Lock, 
  User, 
  Zap, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Wallet
} from "lucide-react";
import { registerDriverAction } from "@/app/actions/register-driver";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Création en cours...
        </>
      ) : (
        <>
          Devenir Livreur KoliSync <Zap className="h-4 w-4" />
        </>
      )}
    </button>
  );
}

export default function SignupDriverPage() {
  const [state, formAction] = useActionState(registerDriverAction, null);

  return (
    <div className="flex min-h-screen bg-white font-sans">
      
      {/* ── COLONNE GAUCHE : ARGUMENTAIRE (Cachée sur mobile) ── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-slate-900 text-white p-12 relative overflow-hidden">
        {/* Effets visuels premium */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
          <div className="mt-16">
            <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-400 mb-6 border border-emerald-500/20">
              <Navigation className="h-4 w-4" /> Application PWA
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tighter leading-tight mb-6">
              L&apos;indépendance, <br />avec la <span className="text-emerald-400">sécurité</span> en plus.
            </h1>
            <p className="text-lg font-medium text-slate-400 max-w-md leading-relaxed">
              Rejoignez la flotte certifiée KoliSync. Accédez à la bourse publique des expéditions et gérez votre argent via notre SocialWallet.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          {[
            { title: "Bourse Publique", desc: "Trouvez des courses autour de vous." },
            { title: "Itinéraire Intelligent", desc: "Guidage GPS natif et optimisé." },
            { title: "SocialWallet Intégré", desc: "Retraits directs sur Mobile Money." }
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-emerald-400 border border-slate-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-white">{feature.title}</p>
                <p className="text-sm font-medium text-slate-400">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COLONNE DROITE : FORMULAIRE D'INSCRIPTION ── */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 bg-white relative z-10">
        
        {/* Navigation Mobile uniquement */}
        <div className="lg:hidden mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="text-center mb-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/50">
              <Wallet className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Créer mon compte</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">100% gratuit pour les livreurs.</p>
          </div>

          <form action={formAction} className="space-y-5">
            
            {state?.error && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 ring-1 ring-red-200 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                {state.error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-xs font-black uppercase tracking-widest text-slate-900 mb-2">
                Nom ou Pseudo
              </label>
              <div className="relative">
                <User className="absolute inset-y-0 left-0 ml-4 h-full w-5 text-slate-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Ex: John Doe"
                  className="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-black uppercase tracking-widest text-slate-900 mb-2">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Phone className="absolute inset-y-0 left-0 ml-4 h-full w-5 text-slate-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  placeholder="Ex: 01 02 03 04 05"
                  className="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="pin" className="block text-xs font-black uppercase tracking-widest text-slate-900 mb-2">
                  Code PIN
                </label>
                <div className="relative">
                  <Lock className="absolute inset-y-0 left-0 ml-4 h-full w-5 text-slate-400" />
                  <input
                    type="password"
                    id="pin"
                    name="pin"
                    required
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="••••"
                    className="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 font-bold tracking-widest text-lg"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="confirmPin" className="block text-xs font-black uppercase tracking-widest text-slate-900 mb-2">
                  Confirmer
                </label>
                <div className="relative">
                  <Lock className="absolute inset-y-0 left-0 ml-4 h-full w-5 text-slate-400" />
                  <input
                    type="password"
                    id="confirmPin"
                    name="confirmPin"
                    required
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="••••"
                    className="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 font-bold tracking-widest text-lg"
                  />
                </div>
              </div>
            </div>

            <SubmitButton />
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Déjà dans la flotte ?{" "}
            <Link href="/login" className="font-bold text-emerald-600 hover:text-emerald-500">
              Connectez-vous ici.
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
