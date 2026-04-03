import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Politique de Confidentialité | KoliSync",
  description: "Comment nous protégeons vos données sur KoliSync.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Confidentialité</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8">
          
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Politique de Confidentialité</h2>
            <p className="text-sm text-slate-500 font-medium">Dernière mise à jour : Avril 2026</p>
          </div>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-800">1. Données Collectées</h3>
            <p className="text-slate-600 leading-relaxed text-sm">Pour assurer le bon fonctionnement de KoliSync, nous collectons :</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-relaxed text-sm">
              <li><strong className="text-slate-800">Identification :</strong> Nom, numéro de téléphone, adresse email.</li>
              <li><strong className="text-slate-800">Localisation (GPS) :</strong> Position en arrière-plan des Livreurs actifs pour sécuriser les retraits et livraisons.</li>
              <li><strong className="text-slate-800">Clients Finaux :</strong> Numéro de téléphone et adresse (fournis par le Commerçant).</li>
              <li><strong className="text-slate-800">Financier :</strong> Historique des transactions du Wallet.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-800">2. Finalité du Traitement</h3>
            <p className="text-slate-600 leading-relaxed text-sm">Vos données sont exclusivement utilisées pour :</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-relaxed text-sm">
              <li>Exécuter le service de mise en relation et de suivi.</li>
              <li>Assurer la sécurité des fonds via Géofencing et Code PIN.</li>
              <li>Lutter contre la fraude (Blacklisting réseau).</li>
              <li>Gérer la facturation et les cautions.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-800">3. Partage des Données</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Vos données personnelles ne sont jamais vendues à des tiers. Elles sont uniquement partagées dans le cadre strict de l&apos;exécution de la livraison (Livreur assigné, Commerçant d&apos;origine).
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-800">4. Sécurité et Conservation</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Nous mettons en œuvre des mesures techniques (chiffrement, tokens) pour protéger vos données. Les historiques d&apos;événements de livraison sont conservés de manière immuable pour des raisons de résolution des litiges.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-800">5. Vos Droits</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données. La suppression d&apos;un compte ne peut aboutir si des transactions (COD non reversé) ou des litiges sont en cours.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
