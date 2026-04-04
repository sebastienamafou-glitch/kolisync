"use client";

import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { 
  ArrowLeft, User, Phone, MapPin, Banknote, Loader2, PackagePlus,
  ShieldAlert, ShieldCheck, Globe, Map, Zap, Lock, Store
} from "lucide-react";

import { createPackageAction } from "@/app/actions/packages";
// 🚨 CORRECTION : On importe notre nouveau moteur de risque dédié
import { checkCustomerRiskAction, type RiskResponse } from "@/app/actions/risk";

const COMMUNES = [
  "Plateau", "Cocody", "Abobo", "Adjamé", "Attécoubé", 
  "Treichville", "Marcory", "Koumassi", "Port-Bouët", "Yopougon",
  "Anyama", "Songon", "Bingerville", "Grand-Bassam", "Aboisso", "Dabou", "Sassandra", "San Pedro"
];

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:px-8"
    >
      {pending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          Création...
        </>
      ) : (
        <>
          <PackagePlus className="h-5 w-5" />
          Créer l'expédition
        </>
      )}
    </button>
  );
}

export default function NewPackagePage() {
  const [state, formAction] = useActionState(createPackageAction, null);
  const [phone, setPhone] = useState("");
  // 🚨 CORRECTION : Utilisation du typage strict du Trust Engine
  const [risk, setRisk] = useState<RiskResponse | null>(null);

  useEffect(() => {
    const checkRisk = async () => {
      const cleanPhone = phone.replace(/\s/g, "");
      if (cleanPhone.length >= 8) {
        const result = await checkCustomerRiskAction(cleanPhone);
        setRisk(result);
      } else {
        setRisk(null);
      }
    };
    
    // Debounce : évite de spammer la base de données à chaque frappe
    const timer = setTimeout(checkRisk, 500);
    return () => clearTimeout(timer);
  }, [phone]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-24">
      
      <div className="flex items-center gap-4">
        <Link 
          href="/b2b" 
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Nouvelle expédition
          </h1>
          <p className="text-sm text-slate-500">
            Saisissez les informations et choisissez le mode de diffusion.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <form action={formAction} className="p-6 sm:p-8 space-y-6">
          
          {state?.error === "QUOTA_EXCEEDED" ? (
            <div className="rounded-2xl bg-blue-50/50 p-8 text-center ring-1 ring-blue-500/20 relative overflow-hidden animate-in fade-in slide-in-from-top-4">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Lock className="h-24 w-24 text-blue-900" />
              </div>
              <div className="relative z-10">
                <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center ring-1 ring-blue-100 shadow-sm mb-4">
                  <Zap className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="font-black text-xl text-slate-900 tracking-tight mb-2">Plafond gratuit atteint</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-md mx-auto mb-8">
                  {state.message}
                </p>
                <Link 
                  href="/b2b/upgrade" 
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-[0.98] sm:w-auto"
                >
                  <Zap className="h-4 w-4" />
                  Débloquer l'accès PRO
                </Link>
              </div>
            </div>
          ) : state?.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600 animate-in fade-in slide-in-from-top-2 flex items-center gap-3">
               <ShieldAlert className="h-5 w-5 shrink-0" />
               {state.error}
            </div>
          ) : null}

          <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 mb-6">
            <label htmlFor="pickupAddress" className="block text-sm font-semibold text-blue-900">
              Adresse de retrait (Boutique / Entrepôt)
            </label>
            <div className="relative mt-2">
              <Store className="absolute inset-y-0 left-0 ml-3 h-10 w-5 text-blue-400" />
              <input
                type="text"
                id="pickupAddress"
                name="pickupAddress"
                required
                placeholder="Ex: Plateau, Rue du Commerce, Immeuble XL"
                className="block w-full rounded-xl border-0 py-3 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-blue-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm font-medium"
              />
            </div>
            <p className="mt-2 text-[11px] font-medium text-blue-600">
              Cette adresse guidera le GPS du livreur jusqu'à vous.
            </p>
          </div>

          <hr className="border-slate-100" />

          <div>
            <label htmlFor="customerName" className="block text-sm font-semibold text-slate-900">
              Nom du destinataire
            </label>
            <div className="relative mt-2">
              <User className="absolute inset-y-0 left-0 ml-3 h-10 w-5 text-slate-400" />
              <input
                type="text"
                id="customerName"
                name="customerName"
                required
                placeholder="Ex: Adjoua Koné"
                className="block w-full rounded-xl border-0 py-3 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm"
              />
            </div>
          </div>

          {/* 🚨 KOLISYNC TRUST ENGINE : Interface de Radar */}
          <div>
            <label htmlFor="customerPhone" className="block text-sm font-semibold text-slate-900">
              Numéro de téléphone
            </label>
            <div className="relative mt-2">
              <Phone className="absolute inset-y-0 left-0 ml-3 h-10 w-5 text-slate-400" />
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 01 77 00 00 01"
                className={`block w-full rounded-xl border-0 py-3 pl-10 pr-3 text-slate-900 ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm transition-colors ${
                  risk?.status === "DANGER" ? "ring-red-400 focus:ring-red-500" : 
                  risk?.status === "WARNING" ? "ring-orange-400 focus:ring-orange-500" : 
                  risk?.status === "SAFE" ? "ring-emerald-400 focus:ring-emerald-500 bg-emerald-50/30" : 
                  "ring-slate-300 focus:ring-amber-500"
                }`}
              />
            </div>

            {/* Affichage conditionnel des badges de sécurité */}
            {risk?.status === "DANGER" && (
              <div className="mt-3 flex items-start gap-3 rounded-xl bg-red-50 p-4 ring-1 ring-red-200 animate-in slide-in-from-top-2">
                <ShieldAlert className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-900">Fraudeur détecté par KoliSync</p>
                  <p className="mt-1 text-xs text-red-700 leading-relaxed">
                    Signalé <span className="font-black">{risk.reportCount} fois</span> sur le réseau. <br/>
                    Dernier motif : <span className="italic">"{risk.lastReason}"</span>. <br/>
                    <strong className="text-red-900">Paiement d'avance (Mobile Money) fortement exigé.</strong>
                  </p>
                </div>
              </div>
            )}

            {risk?.status === "WARNING" && (
              <div className="mt-3 flex items-start gap-3 rounded-xl bg-orange-50 p-4 ring-1 ring-orange-200 animate-in slide-in-from-top-2">
                <ShieldAlert className="h-5 w-5 shrink-0 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-orange-900">Client à risque (Avertissement)</p>
                  <p className="mt-1 text-xs text-orange-700 leading-relaxed">
                    Signalé <span className="font-black">{risk.reportCount} fois</span>. <br/>
                    Dernier motif : <span className="italic">"{risk.lastReason}"</span>. <br/>PIN de sécurité conseillé.
                  </p>
                </div>
              </div>
            )}

            {risk?.status === "SAFE" && (
              <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-emerald-600 animate-in fade-in uppercase tracking-widest">
                <ShieldCheck className="h-4 w-4" /> Client fiable (Aucun litige)
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="commune" className="block text-sm font-semibold text-slate-900">
                Commune de livraison
              </label>
              <div className="relative mt-2">
                <Map className="absolute inset-y-0 left-0 ml-3 h-10 w-5 text-slate-400" />
                <select
                  id="commune"
                  name="commune"
                  required
                  className="block w-full rounded-xl border-0 py-3 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-amber-500 sm:text-sm"
                >
                  <option value="">Choisir...</option>
                  {COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="deliveryAddress" className="block text-sm font-semibold text-slate-900">
                Quartier / Précisions
              </label>
              <div className="relative mt-2">
                <MapPin className="absolute inset-y-0 left-0 ml-3 h-10 w-5 text-slate-400" />
                <input
                  type="text"
                  id="deliveryAddress"
                  name="deliveryAddress"
                  placeholder="Ex: Angré 8ème tranche"
                  className="block w-full rounded-xl border-0 py-3 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-amber-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-600">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Diffuser publiquement</p>
                  <p className="text-xs text-slate-500">Rendre visible à tous les livreurs KoliSync (Bourse aux courses).</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                name="isPublic" 
                value="on"
                className="h-6 w-6 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer" 
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="amountDue" className="block text-sm font-semibold text-slate-900">
                  Total COD à collecter
                </label>
                <div className="relative mt-2">
                  <Banknote className="absolute inset-y-0 left-0 ml-3 h-10 w-5 text-amber-500" />
                  <input
                    type="number"
                    id="amountDue"
                    name="amountDue"
                    required
                    min="1"
                    className="block w-full rounded-xl border-0 py-3 pl-10 text-slate-900 ring-1 ring-inset ring-amber-300 focus:ring-2 focus:ring-amber-500 sm:text-sm font-bold"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="deliveryFee" className="block text-sm font-semibold text-slate-900">
                  Rémunération livreur
                </label>
                <div className="relative mt-2">
                  <Banknote className="absolute inset-y-0 left-0 ml-3 h-10 w-5 text-slate-400" />
                  <input
                    type="number"
                    id="deliveryFee"
                    name="deliveryFee"
                    required
                    min="0"
                    defaultValue="1000"
                    className="block w-full rounded-xl border-0 py-3 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-slate-900 sm:text-sm font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
              <label htmlFor="depositAmount" className="block text-sm font-semibold text-slate-900">
                Caution exigée (Séquestre livreur)
              </label>
              <div className="relative mt-2">
                <ShieldCheck className="absolute inset-y-0 left-0 ml-3 h-10 w-5 text-emerald-500" />
                <input
                  type="number"
                  id="depositAmount"
                  name="depositAmount"
                  min="0"
                  defaultValue="0"
                  className="block w-full rounded-xl border-0 py-3 pl-10 text-slate-900 ring-1 ring-inset ring-emerald-200 focus:ring-2 focus:ring-emerald-500 sm:text-sm font-bold"
                />
              </div>
              <p className="mt-2.5 text-[11px] font-medium text-slate-500 leading-relaxed">
                Montant qui sera temporairement gelé sur le portefeuille du livreur. <br/>
                <span className="text-amber-600 font-bold">Fortement recommandé si vous diffusez le colis publiquement.</span> (0 = aucune caution)
              </p>
            </div>
          </div>

          <div className={`flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end ${state?.error === "QUOTA_EXCEEDED" ? "opacity-50 pointer-events-none" : ""}`}>
            <Link
              href="/b2b"
              className="flex items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 sm:px-8"
            >
              Annuler
            </Link>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
