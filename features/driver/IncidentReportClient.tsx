"use client";

import { useState, useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { MessageSquare, AlertTriangle, MapPin, Loader2, X, ShieldAlert } from "lucide-react";
import { reportIncidentAction } from "@/app/actions/delivery";

// ── Composant Bouton (Nécessaire pour lire le useFormStatus) ──
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-orange-600/20 transition-transform active:scale-95 disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          <AlertTriangle className="h-5 w-5" />
          Soumettre le litige
        </>
      )}
    </button>
  );
}

// ── Composant Principal ──
export default function IncidentReportClient({ orderId }: { orderId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Utilisation standard de useActionState (Next.js 14/15)
  const [state, formAction] = useActionState(reportIncidentAction, null);

  // Fermer la modale automatiquement si le signalement réussit
  useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
      // Optionnel : on pourrait afficher un toast de succès ici
    }
  }, [state?.success]);

  // Capture GPS
  const handleCaptureGps = () => {
    setIsLocating(true);
    setGpsError(null);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGps({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
          setGpsError("Impossible de capturer le GPS. Vérifiez vos permissions.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsLocating(false);
      setGpsError("Le GPS n'est pas supporté sur cet appareil.");
    }
  };

  return (
    <>
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-medium text-slate-600 mb-4">
          Le client refuse de payer ou conteste la réception ? Signalez-le pour protéger votre compte.
        </p>
        <button 
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-50 py-3.5 text-sm font-bold text-orange-600 transition-all active:scale-95 ring-1 ring-orange-200"
        >
          <MessageSquare className="h-4 w-4" /> 
          Signaler un litige / Me défendre
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in slide-in-from-bottom-8">
            
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="flex items-center gap-2 text-lg font-black text-slate-900">
                <ShieldAlert className="h-5 w-5 text-orange-500" />
                Détails du litige
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Formulaire natif Server Action */}
            <form action={formAction} className="p-6 space-y-6">
              
              <input type="hidden" name="orderId" value={orderId} />
              {gps && (
                <>
                  <input type="hidden" name="latitude" value={gps.lat} />
                  <input type="hidden" name="longitude" value={gps.lng} />
                </>
              )}

              {state?.error && (
                <div className="rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 ring-1 ring-red-200">
                  {state.error}
                </div>
              )}

              <div>
                <label htmlFor="reason" className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                  Motif exact
                </label>
                <select 
                  id="reason" 
                  name="reason" 
                  required
                  className="block w-full rounded-2xl border-0 bg-slate-50 py-3.5 pl-4 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-orange-500 sm:text-sm font-medium"
                >
                  <option value="">Sélectionnez un motif...</option>
                  <option value="CLIENT_ABSENT">Le client est absent / injoignable</option>
                  <option value="REFUSAL_TO_PAY">Le client refuse de payer le montant COD</option>
                  <option value="CLIENT_LIAR">Client de mauvaise foi (prétend n'avoir rien reçu)</option>
                  <option value="OTHER">Autre problème de sécurité</option>
                </select>
              </div>

              <div>
                <label htmlFor="comment" className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                  Votre témoignage
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={3}
                  required
                  placeholder="Expliquez la situation en quelques mots..."
                  className="block w-full rounded-2xl border-0 bg-slate-50 py-3 px-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 sm:text-sm resize-none"
                />
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-600">Preuve de présence</span>
                  {gps ? (
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Capturé</span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Recommandé</span>
                  )}
                </div>
                
                {gpsError && <p className="text-xs text-red-500 font-medium mb-2">{gpsError}</p>}

                <button
                  type="button"
                  onClick={handleCaptureGps}
                  disabled={isLocating || gps !== null}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
                    gps 
                      ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200" 
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 active:scale-95"
                  }`}
                >
                  {isLocating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : gps ? (
                    <>
                      <MapPin className="h-4 w-4" /> Coordonnées enregistrées
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4" /> Ajouter ma position GPS
                    </>
                  )}
                </button>
              </div>

              <SubmitButton />
            </form>
          </div>
        </div>
      )}
    </>
  );
}
