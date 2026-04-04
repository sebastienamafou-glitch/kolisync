"use client";

import { useActionState } from "react";
import { registerAction } from "@/app/actions/auth";
import Link from "next/link";
import { 
  Building2, 
  User, 
  Phone, 
  Lock, 
  ArrowRight, 
  Package, 
  AlertCircle,
  Loader2 
} from "lucide-react";

const initialState = { error: "" };

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-slate-900/20">
          <Package className="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">KoliSync Business</h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">
          Créez votre entreprise et commencez à expédier.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-2xl shadow-slate-200/60 rounded-[2.5rem] border border-slate-100">
          <form action={formAction} className="space-y-6">

            {state?.error && (
              <div className="flex items-start gap-3 rounded-2xl bg-red-50 px-4 py-4 ring-1 ring-red-200 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                <p className="text-sm font-bold text-red-700">{state.error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Structure
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="companyName"
                  type="text"
                  required
                  placeholder="Nom de votre entreprise"
                  className="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-900 transition-all sm:text-sm font-semibold"
                />
              </div>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 font-black text-slate-300 tracking-widest">Propriétaire</span></div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Votre nom complet"
                  className="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-900 transition-all sm:text-sm font-semibold"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="Numéro de téléphone"
                  className="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-900 transition-all sm:text-sm font-semibold"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="pinCode"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  minLength={4}
                  required
                  placeholder="Code PIN (4 chiffres)"
                  className="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-900 transition-all sm:text-sm font-black tracking-[0.5em]"
                />
              </div>
            </div>

            {/* 🚨 CHECKBOX LÉGALE BOUTIQUE B2B */}
            <div className="flex items-start gap-3 mt-6">
              <input
                type="checkbox"
                name="acceptTerms"
                id="acceptTermsB2B"
                required
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <label htmlFor="acceptTermsB2B" className="text-[11px] text-slate-500 leading-relaxed font-medium">
                J&apos;ai lu et j&apos;accepte les{" "}
                <Link href="/cgu" className="font-bold text-slate-900 hover:underline">Conditions Générales d&apos;Utilisation</Link>
                {" "}et la{" "}
                <Link href="/privacy" className="font-bold text-slate-900 hover:underline">Politique de Confidentialité</Link>.
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center items-center gap-3 py-4 px-6 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 mt-6"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Initialisation...
                </>
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              Déjà membre de la flotte ?{" "}
              <Link href="/login" className="font-black text-slate-900 hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
