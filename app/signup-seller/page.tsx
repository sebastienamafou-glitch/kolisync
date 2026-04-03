"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { 
  Store, 
  Phone, 
  Lock, 
  ShieldCheck, 
  Zap, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  User // 👈 Ajout de l'icône
} from "lucide-react";
import { registerSellerAction } from "@/app/actions/register";

// ── Composant Bouton avec gestion du chargement ──
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-blue-600/20 transition-all hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Création en cours...
        </>
      ) : (
        <>
          Créer ma boutique <Zap className="h-4 w-4" />
        </>
      )}
    </button>
  );
}

export default function SignupSellerPage() {
  const [state, formAction] = useActionState(registerSellerAction, null);

  return (
    <div className="flex min-h-screen bg-white font-sans">
      
      {/* ── COLONNE GAUCHE : RASSURANCE (Cachée sur mobile) ── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-slate-50 p-12 relative overflow-hidden border-r border-slate-100">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>
          <div className="mt-16">
            <div className="inline-flex items-center gap-2 rounded-xl bg-blue-100 px-3 py-1 text-xs font-black uppercase tracking-widest text-blue-700 mb-6">
              <Store className="h-4 w-4" /> Espace B2B
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-slate-950 tracking-tighter leading-tight mb-6">
              Reprenez le contrôle <br />de vos <span className="text-blue-600">expéditions</span>.
            </h1>
            <p className="text-lg font-medium text-slate-600 max-w-md leading-relaxed">
              KoliSync vous offre 30 expéditions gratuites pour tester la puissance de notre plateforme. Zéro engagement.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          {[
            { title: "Zéro-Perte Garanti", desc: "Le code PIN protège vos colis." },
            { title: "Bourse Publique", desc: "Trouvez un livreur instantanément." },
            { title: "Comptabilité Claire", desc: "Fini les calculs sur papier." }
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 text-blue-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900">{feature.title}</p>
                <p className="text-sm font-medium text-slate-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COLONNE DROITE : FORMULAIRE D'INSCRIPTION ── */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-24">
        
        {/* Navigation Mobile uniquement */}
        <div className="lg:hidden mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="text-center mb-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Créer mon espace</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">Rejoignez les e-commerçants sécurisés.</p>
          </div>

          <form action={formAction} className="space-y-5">
            
            {state?.error && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 ring-1 ring-red-200 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                {state.error}
              </div>
            )}

            <div>
              <label htmlFor="shopName" className="block text-xs font-black uppercase tracking-widest text-slate-900 mb-2">
                Nom de la boutique
              </label>
              <div className="relative">
                <Store className="absolute inset-y-0 left-0 ml-4 h-full w-5 text-slate-400" />
                <input
                  type="text"
                  id="shopName"
                  name="shopName"
                  required
                  placeholder="Ex: Abidjan Sneakers"
                  className="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 font-bold"
                />
              </div>
            </div>

            {/* ── NOUVEAU CHAMP : NOM DU GÉRANT ── */}
            <div>
              <label htmlFor="ownerName" className="block text-xs font-black uppercase tracking-widest text-slate-900 mb-2">
                Nom du gérant
              </label>
              <div className="relative">
                <User className="absolute inset-y-0 left-0 ml-4 h-full w-5 text-slate-400" />
                <input
                  type="text"
                  id="ownerName"
                  name="ownerName"
                  required
                  placeholder="Ex: Jean Dupont"
                  className="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-black uppercase tracking-widest text-slate-900 mb-2">
                Numéro de téléphone (Admin)
              </label>
              <div className="relative">
                <Phone className="absolute inset-y-0 left-0 ml-4 h-full w-5 text-slate-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  placeholder="Ex: 01 02 03 04 05"
                  className="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 font-bold"
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
                    className="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 font-bold tracking-widest text-lg"
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
                    className="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 font-bold tracking-widest text-lg"
                  />
                </div>
              </div>
            </div>

            <SubmitButton />
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Déjà inscrit ?{" "}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-500">
              Connectez-vous ici.
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
