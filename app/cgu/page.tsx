import Link from "next/link";
import { ChevronLeft, Scale } from "lucide-react";

export const metadata = {
  title: "Conditions Générales d'Utilisation | KoliSync",
  description: "Conditions d'utilisation et cadre légal de la plateforme logistique KoliSync.",
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
            <h1 className="text-lg font-black text-slate-900 tracking-tight">CGU & Cadre Légal</h1>
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
            <h3 className="text-lg font-black text-slate-800">1. Présentation du Service et Indépendance</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              KoliSync est une plateforme technologique de mise en relation permettant à des commerçants professionnels (Commerçants B2B) de confier la livraison de leurs colis à des coursiers indépendants (Livreurs). KoliSync agit exclusivement en tant qu&apos;intermédiaire technologique. 
              <br /><br />
              <strong className="text-slate-800">Absence de lien de subordination :</strong> Les Livreurs opèrent en tant que prestataires indépendants. L&apos;utilisation de la plateforme ne crée aucun contrat de travail, de salariat ou de franchise entre le Livreur et KoliSync.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-800">2. Conformité Routière et Vérification (KYC)</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Afin de garantir la sécurité du réseau, tout Livreur souhaitant accéder aux offres de livraison doit soumettre un dossier de conformité obligatoire.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-relaxed text-sm">
              <li><strong className="text-slate-800">Documents exigés :</strong> Pièce d&apos;identité valide, selfie de contrôle, permis de conduire adéquat et certificat d&apos;immatriculation (Carte Grise) du véhicule utilisé.</li>
              <li><strong className="text-slate-800">Authenticité :</strong> Le Livreur garantit l&apos;exactitude des documents fournis. Toute falsification entraînera le bannissement immédiat de la plateforme et un signalement aux autorités compétentes.</li>
              <li><strong className="text-slate-800">Arbitrage KoliSync :</strong> KoliSync se réserve le droit exclusif et discrétionnaire d&apos;approuver, de suspendre ou de rejeter un profil si les critères de sécurité ne sont pas remplis.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-800">3. Assurances et Responsabilité Civile</h3>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-relaxed text-sm">
              <li><strong className="text-slate-800">Responsabilité du véhicule :</strong> Le Livreur est l&apos;unique responsable de l&apos;entretien de son véhicule et de son assurance. Il s&apos;engage à maintenir une police d&apos;assurance valide couvrant son activité professionnelle.</li>
              <li><strong className="text-slate-800">Accidents de la circulation :</strong> KoliSync décline toute responsabilité en cas d&apos;accident matériel ou corporel impliquant le Livreur, un tiers ou la marchandise pendant le trajet.</li>
              <li><strong className="text-slate-800">Contact d&apos;urgence :</strong> Le numéro d&apos;urgence fourni lors de l&apos;inscription ne sera contacté par KoliSync qu&apos;en cas de force majeure, d&apos;accident grave signalé ou d&apos;incapacité du Livreur.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-800">4. Géolocalisation et Preuves de Livraison</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              L&apos;application KoliSync intègre un système de suivi par géolocalisation pour sécuriser les transactions.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-relaxed text-sm">
              <li>La validation de la livraison par le Livreur n&apos;est techniquement opposable qu&apos;à l&apos;aide d&apos;une empreinte GPS prouvant sa présence sur le lieu convenu.</li>
              <li>En cas de litige (client absent, refus de payer), la position GPS enregistrée fait foi pour prouver le déplacement du Livreur.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-800">5. Gestion Financière et Cautions</h3>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-relaxed text-sm">
              <li><strong className="text-slate-800">Collecte d&apos;espèces (COD) :</strong> Le Livreur assume l&apos;entière responsabilité des fonds collectés dès la saisie du code PIN de sécurité ou de la validation GPS.</li>
              <li><strong className="text-slate-800">Plafond de confiance :</strong> KoliSync impose un plafond maximum d&apos;espèces qu&apos;un Livreur peut détenir. Une fois ce plafond atteint, l&apos;accès aux nouvelles courses est bloqué jusqu&apos;au reversement.</li>
              <li><strong className="text-slate-800">Caution et Bourse Publique :</strong> Une caution numérique peut être gelée sur le Portefeuille Social du Livreur à titre de garantie pour accéder à certaines commandes, et lui sera restituée selon les termes en vigueur.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-slate-800">6. Protection des Données Personnelles</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Conformément à la législation en vigueur relative à la protection des données (notamment les directives de l&apos;ARTCI), KoliSync collecte et traite les données personnelles (identité, biométrie, géolocalisation) de manière sécurisée et chiffrée.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-relaxed text-sm">
              <li>Ces données sont strictement utilisées pour la vérification d&apos;identité (lutte anti-fraude), le bon fonctionnement logistique et la résolution des litiges.</li>
              <li>KoliSync s&apos;interdit de revendre ces données à des tiers, mais se réserve le droit de les transmettre aux autorités judiciaires sur réquisition officielle (en cas de vol ou délit de fuite).</li>
            </ul>
          </section>

        </div>
      </main>
    </div>
  );
}
