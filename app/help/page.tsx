import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LifeBuoy, Mail, Activity, Package, ShieldAlert } from "lucide-react";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

export const metadata = {
  title: "Centre d'Aide | KoliSync",
  description: "Support et assistance pour les vendeurs et livreurs KoliSync.",
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-cyan-500/20">
      
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-slate-900 p-1">
              <Image src="/logo.png" alt="Logo KoliSync" fill className="object-contain" sizes="32px" />
            </div>
            <span className="font-display text-lg font-bold">KoliSync</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Retour au site</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 md:py-20">
        
        {/* ── HERO SECTION ── */}
        <div className="mb-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600">
            <LifeBuoy className="h-8 w-8" />
          </div>
          <h1 className="font-display mb-4 text-3xl font-black md:text-5xl">Comment pouvons-nous vous aider ?</h1>
          <p className="mx-auto max-w-lg text-slate-500 text-lg font-medium">
            Trouvez des réponses rapides à vos questions ou contactez notre équipe d'assistance technique.
          </p>
        </div>

        {/* ── CONTACTS CARDS ── */}
        <div className="mb-16 grid gap-6 md:grid-cols-2">
          {/* Card WhatsApp */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
            <h2 className="mb-2 text-xl font-bold">Assistance Prioritaire</h2>
            <p className="mb-6 text-sm text-slate-500">Pour les urgences terrain et les litiges de livraison, notre équipe vous répond en moins de 5 minutes.</p>
            <WhatsAppButton variant="inline" />
          </div>

          {/* Card Email & Status */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
            <div>
              <h2 className="mb-2 text-xl font-bold">Support Administratif</h2>
              <p className="mb-6 text-sm text-slate-500">Pour les questions de facturation ou les dossiers KYC complexes.</p>
              <a href="mailto:support@kolisync.com" className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-cyan-600 transition-colors">
                <Mail className="h-5 w-5" /> support@kolisync.com
              </a>
            </div>
            
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-50 px-4 py-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Tous les systèmes sont opérationnels</span>
            </div>
          </div>
        </div>

        {/* ── FAQ SECTION (Zero JS) ── */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-8 text-2xl font-black">Questions Fréquentes (FAQ)</h2>

          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4 mt-8">
              <Package className="h-5 w-5 text-cyan-600" />
              <h3 className="text-lg font-bold text-slate-800">Espace Vendeurs B2B</h3>
            </div>
            <details className="group border-b border-slate-100 pb-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-700 hover:text-cyan-600">
                Quand l'argent de mes colis livrés est-il reversé ?
                <span className="transition duration-300 group-open:-rotate-180">▾</span>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                Dès qu'un colis passe au statut "LIVRÉ", le montant est sécurisé dans notre système. Les reversements vers votre compte Mobile Money sont effectués automatiquement selon le cycle défini dans vos paramètres (Généralement à J+1).
              </p>
            </details>
            <details className="group border-b border-slate-100 pb-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-700 hover:text-cyan-600">
                Que se passe-t-il si un client refuse le colis ?
                <span className="transition duration-300 group-open:-rotate-180">▾</span>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                Le livreur mettra le colis en statut "RETOUR". Vous serez notifié en temps réel sur votre tableau de bord et le colis vous sera ramené sans frais supplémentaires d'expédition.
              </p>
            </details>

            <div className="flex items-center gap-2 mb-4 mt-10">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-800">Espace Livreurs (PWA)</h3>
            </div>
            <details className="group border-b border-slate-100 pb-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-700 hover:text-cyan-600">
                Pourquoi mon compte est-il bloqué sur "Identité requise" ?
                <span className="transition duration-300 group-open:-rotate-180">▾</span>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                Pour garantir la sécurité des fonds (Cash on Delivery), tous les livreurs doivent passer le KYC. Veuillez uploader une photo nette de votre pièce d'identité. La validation prend moins de 24h.
              </p>
            </details>
            <details className="group pb-2 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-700 hover:text-cyan-600">
                Le client ne répond pas au téléphone, que faire ?
                <span className="transition duration-300 group-open:-rotate-180">▾</span>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                Signalez le problème directement dans l'application en modifiant le statut du colis sur "CONFLIT/INJOIGNABLE". Le vendeur sera alerté et pourra tenter de joindre son client. Ne retournez pas le colis sans l'accord du système.
              </p>
            </details>
          </div>
        </div>

      </main>
    </div>
  );
}
