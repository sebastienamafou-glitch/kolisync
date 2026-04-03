import Link from "next/link";
import { ChevronLeft, Scale } from "lucide-react";

export const metadata = {
  title: "Conditions Générales d'Utilisation | KoliSync",
  description: "Conditions d'utilisation de la plateforme logistique KoliSync.",
};

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-slate-900" />
            <h1 className="text-lg font-black text-slate-900 tracking-tight">CGU</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-8">
        <div className="bg-white p-8 rounded-4xl shadow-sm border border-slate-100 space-y-8">
          
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Conditions Générales d&apos;Utilisation</h2>
            <p className="text-sm text-slate-500 font-medium">Dernière mise à jour : Avril 2026</p>
          </div>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-800">1. Présentation du Service</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              KoliSync est une plateforme de mise en relation logistique (SaaS et PWA) permettant à des commerçants professionnels (Commerçants B2B) de confier la livraison de leurs colis à des coursiers indépendants (Livreurs). KoliSync agit exclusivement en tant qu&apos;intermédiaire technologique et ne possède ni les marchandises, ni les véhicules de livraison.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-800">2. Rôles et Engagements des Parties</h3>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-relaxed text-sm">
              <li>
                <strong className="text-slate-800">Le Commerçant :</strong> S&apos;engage à fournir des informations exactes sur le contenu du colis, l&apos;adresse de retrait, et les coordonnées du client final. Le commerçant est responsable de la conformité de ses marchandises avec la loi ivoirienne.
              </li>
              <li>
                <strong className="text-slate-800">Le Livreur :</strong> Agit en tant que prestataire indépendant. En acceptant une course via la plateforme (invitation privée ou Bourse Globale), il s&apos;engage à récupérer et livrer le colis dans les meilleurs délais, et à restituer l&apos;intégralité des fonds collectés (Cash on Delivery) au Commerçant.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-800">3. Géolocalisation et Preuves de Livraison</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              L&apos;application KoliSync intègre un système de suivi par géolocalisation (Géofencing).
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-relaxed text-sm">
              <li>La validation du retrait et de la livraison par le Livreur n&apos;est techniquement possible et opposable qu&apos;à l&apos;aide d&apos;une empreinte GPS validant sa présence physique du lieu convenu.</li>
              <li>En cas de litige (client absent, refus de payer), la position GPS enregistrée par le Livreur fait foi pour prouver son déplacement.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-800">4. Gestion Financière, Wallet et Cautions</h3>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-relaxed text-sm">
              <li><strong className="text-slate-800">Collecte d&apos;espèces (COD) :</strong> Le Livreur assume l&apos;entière responsabilité des fonds collectés dès la saisie du code PIN de sécurité ou de la validation GPS.</li>
              <li><strong className="text-slate-800">Plafond de sécurité :</strong> KoliSync impose un plafond maximum d&apos;espèces qu&apos;un Livreur peut détenir. Une fois ce plafond atteint, le compte est restreint.</li>
              <li><strong className="text-slate-800">Caution (Bourse Publique) :</strong> Une caution peut être gelée temporairement sur le Portefeuille Social du Livreur à titre de garantie, restituée à la clôture.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-800">5. Retours et Litiges</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Si une livraison échoue indépendamment de la volonté du Livreur (client injoignable) et que le Livreur prouve son déplacement via GPS, il est en droit d&apos;exiger le paiement des frais de livraison. Ces frais sont déduits du compte du Commerçant.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
