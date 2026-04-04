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
            <p className="text-slate-600 leading-relaxed text-sm">Pour assurer la sécurité et la légalité du réseau KoliSync, nous collectons :</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-relaxed text-sm">
              <li><strong className="text-slate-800">Identification de base :</strong> Nom, numéro de téléphone, adresse email.</li>
              <li><strong className="text-slate-800">Conformité et KYC (Livreurs) :</strong> Photocopie de la pièce d&apos;identité (CNI/Passeport) et photographie faciale de contrôle (Selfie).</li>
              <li><strong className="text-slate-800">Sécurité Routière (Livreurs) :</strong> Permis de conduire, certificat d&apos;immatriculation (Carte Grise), plaque d&apos;immatriculation et nom/numéro d&apos;un contact d&apos;urgence.</li>
              <li><strong className="text-slate-800">Localisation (GPS) :</strong> Position en arrière-plan des Livreurs actifs pour sécuriser les retraits, les livraisons et le calcul des litiges.</li>
              <li><strong className="text-slate-800">Clients Finaux :</strong> Numéro de téléphone et adresse de livraison (fournis par le Commerçant B2B).</li>
              <li><strong className="text-slate-800">Financier :</strong> Historique des transactions du Wallet et gestion des cautions.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-800">2. Finalité du Traitement</h3>
            <p className="text-slate-600 leading-relaxed text-sm">Vos données sont exclusivement utilisées pour :</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-relaxed text-sm">
              <li>Vérifier l&apos;identité réelle des Livreurs pour prévenir le vol et l&apos;usurpation d&apos;identité.</li>
              <li>Garantir la conformité des véhicules utilisés et protéger la plateforme en cas d&apos;accident.</li>
              <li>Exécuter le service de mise en relation logistique et assurer le suivi en temps réel.</li>
              <li>Sécuriser la collecte des fonds (COD) via Géofencing et Code PIN.</li>
              <li>Gérer la facturation, les litiges et l&apos;arbitrage.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-800">3. Partage et Accès aux Données</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Vos données personnelles ne sont jamais vendues à des tiers à des fins publicitaires.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-relaxed text-sm">
              <li><strong className="text-slate-800">Dans le cadre d&apos;une livraison :</strong> Seules les informations strictement nécessaires (Prénom, Numéro de téléphone, Plaque d&apos;immatriculation) sont partagées entre le Livreur et le Commerçant.</li>
              <li><strong className="text-slate-800">Documents KYC :</strong> Les documents d&apos;identité (CNI, Permis, Carte Grise) sont strictement confidentiels et ne sont accessibles qu&apos;aux administrateurs habilités du siège KoliSync (HQ).</li>
              <li><strong className="text-slate-800">Réquisition légale :</strong> KoliSync transmettra l&apos;intégralité du dossier KYC et des relevés GPS aux forces de l&apos;ordre ou autorités judiciaires en cas de réquisition officielle (vol de marchandise, délit de fuite, agression).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-800">4. Sécurité et Conservation</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Les documents sensibles (photos, identités) sont stockés sur des serveurs cloud sécurisés et chiffrés. Les historiques d&apos;événements de livraison (PackageEvents) sont conservés de manière immuable pour garantir un audit transparent en cas d&apos;arbitrage.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-800">5. Vos Droits</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données. Toutefois, la suppression d&apos;un compte Livreur ou Commerçant ne peut aboutir si des transactions financières (COD non reversé) ou des litiges sont en cours de traitement.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
