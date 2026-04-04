"use client"; // 👈 1. AJOUTE CECI TOUT EN HAUT DU FICHIER

import { useEffect } from "react"; // 👈 2. IMPORT DE REACT
import { useRouter } from "next/navigation"; // 👈 3. IMPORT DU ROUTER NEXT.JS

import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck, MapPin, Zap, TrendingUp, Wallet,
  Navigation, DollarSign, CheckCircle2, ArrowRight,
  Star, Package, Users, BarChart3, Lock, Globe2,
} from "lucide-react";

const sellerFeatures = [
  { icon: ShieldCheck, title: "Zéro-Perte Cash",          desc: "Chaque FCFA tracé de la boutique au livreur via un code PIN unique. Fini les disputes." },
  { icon: MapPin,      title: "GPS Temps Réel",            desc: "Position live de vos colis et de votre flotte sur une carte interactive." },
  { icon: TrendingUp,  title: "Analytique B2B Avancée",    desc: "Tableaux de bord de performance, tournées optimisées, KPIs automatiques." },
  { icon: Zap,         title: "Bourse Globale Livreurs",   desc: "Flotte certifiée disponible à la demande, en quelques secondes." },
];

const driverFeatures = [
  { icon: Wallet,      title: "SocialWallet Intégré",      desc: "Cotisations retraite automatiques, caution Mobile Money, épargne transparente." },
  { icon: Navigation,  title: "Tournée Intelligente",      desc: "Itinéraire optimisé directement sur votre téléphone. Livrez plus, conduisez moins." },
  { icon: DollarSign,  title: "Gains Immédiats",           desc: "Retirez vos revenus via une simple demande. Votre argent, vos règles." },
  { icon: Globe2,      title: "Indépendance Totale",       desc: "Acceptez les courses de la pool publique et étendez votre activité partout." },
];

const stats = [
  { value: "0 FCFA",  label: "Pertes de cash",            sub: "Garanties contractuellement" },
  { value: "+35%",    label: "Taux de livraison réussi",  sub: "Moyenne plateforme" },
  { value: "< 2min",  label: "Assignation livreur",       sub: "Via la Bourse Globale" },
  { value: "100%",    label: "Traçabilité financière",    sub: "De bout en bout" },
];

export default function PublicHomePage() {
  const router = useRouter(); // 👈 4. INITIALISE LE ROUTER ICI

  // 👈 5. PLACE LE BLOC DE REDIRECTION EXACTEMENT ICI
  useEffect(() => {
    const hasOnboarded = localStorage.getItem("kolisync_onboarded");
    if (!hasOnboarded) {
      router.push("/onboarding");
    }
  }, [router]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

        :root {
          --gold:    #D4A843;
          --gold-lt: #F0C96A;
          --gold-dk: #A07820;
          --night:   #080A0E;
          --surface: #0D1017;
          --card:    #111620;
          --border:  rgba(212,168,67,.12);
          --text:    #E8DCC8;
          --muted:   #6B7280;
        }

        .f-display { font-family: 'Clash Display', sans-serif; }
        .f-body    { font-family: 'Plus Jakarta Sans', sans-serif; }

        /* Grain overlay */
        .koli-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.035'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 9999;
          mix-blend-mode: overlay;
        }

        .gold-text {
          background: linear-gradient(135deg, var(--gold-lt) 0%, var(--gold) 50%, var(--gold-dk) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glow-line {
          position: absolute;
          left: 50%;
          top: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(
            180deg,
            transparent 0%,
            var(--gold) 30%,
            var(--gold-lt) 50%,
            var(--gold) 70%,
            transparent 100%
          );
          box-shadow: 0 0 20px 4px rgba(212,168,67,.3), 0 0 60px 8px rgba(212,168,67,.1);
          transform: translateX(-50%);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .a1 { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both; }
        .a2 { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) .1s both; }
        .a3 { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) .2s both; }
        .a4 { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) .35s both; }
        .a5 { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) .5s both; }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .btn-gold {
          background: linear-gradient(110deg, #A07820 0%, #D4A843 30%, #F0C96A 50%, #D4A843 70%, #A07820 100%);
          background-size: 200% auto;
          animation: shimmer 4s linear infinite;
          color: #080A0E;
          font-weight: 800;
          letter-spacing: .04em;
          transition: box-shadow .25s ease, transform .15s ease;
        }
        .btn-gold:hover {
          box-shadow: 0 0 40px 6px rgba(212,168,67,.35);
          transform: translateY(-1px);
        }
        .btn-gold:active { transform: scale(.97); }

        .btn-ghost {
          border: 1px solid var(--border);
          color: var(--gold);
          transition: background .2s, border-color .2s, transform .15s;
        }
        .btn-ghost:hover {
          background: rgba(212,168,67,.06);
          border-color: rgba(212,168,67,.3);
          transform: translateY(-1px);
        }

        .koli-card {
          background: var(--card);
          border: 1px solid var(--border);
          transition: border-color .3s, box-shadow .3s, transform .2s;
        }
        .koli-card:hover {
          border-color: rgba(212,168,67,.3);
          box-shadow: 0 8px 48px rgba(212,168,67,.07);
          transform: translateY(-2px);
        }

        .radial-seller {
          background: radial-gradient(ellipse 60% 50% at 80% 50%, rgba(59,130,246,.07) 0%, transparent 70%);
        }
        .radial-driver {
          background: radial-gradient(ellipse 60% 50% at 20% 50%, rgba(16,185,129,.07) 0%, transparent 70%);
        }

        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-rev  { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        .ring-spin { animation: spin-slow 18s linear infinite; }
        .ring-rev  { animation: spin-rev  24s linear infinite; }

        .stat-val {
          font-family: 'Clash Display', sans-serif;
          background: linear-gradient(135deg, var(--gold-lt), var(--gold));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        * { scrollbar-width: thin; scrollbar-color: #1a1e2a transparent; }
        *::-webkit-scrollbar { width: 4px; }
        *::-webkit-scrollbar-thumb { background: #1a1e2a; border-radius: 4px; }

        .nav-blur {
          background: rgba(8,10,14,.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }

        .feat-icon-seller { background: rgba(59,130,246,.1); color: #60a5fa; border: 1px solid rgba(59,130,246,.15); }
        .feat-icon-driver { background: rgba(16,185,129,.1); color: #34d399; border: 1px solid rgba(16,185,129,.15); }

        .badge {
          background: rgba(212,168,67,.08);
          border: 1px solid var(--border);
          color: var(--gold);
        }

        @media (max-width: 767px) {
          .hero-col { border-bottom: 1px solid var(--border); }
          .glow-line { display: none; }
        }
      `}</style>

      <div className="koli-root flex flex-col min-h-screen f-body" style={{ background: "var(--night)", color: "var(--text)" }}>

        {/* ══ NAV ══════════════════════════════════════════════════════════════ */}
        <nav className="nav-blur sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {/* Logo Wrapper : Cadre supprimé, styles basculés en classes Tailwind si nécessaire */}
            <div className="relative h-30 w-30 overflow-hidden rounded-xl">
              <Image 
                src="/logo-kolisync-dark.svg" 
                alt="KoliSync" 
                fill 
                className="object-contain p-1"
                priority
              />
            </div>
            
            <span className="f-display text-xl font-bold tracking-tight text-white">
              KoliSync
            </span>
            
            <span className="hidden text-[9px] font-bold uppercase tracking-[.2em] sm:inline-block">
              Côte d&apos;Ivoire
            </span>
          </div>
            <Link href="/login"
              className="btn-ghost flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold">
              Se connecter <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>

        {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
        <header className="relative flex-1 flex flex-col md:flex-row">
          <div className="glow-line hidden md:block" />

          {/* Commerçants */}
          <div className="hero-col flex-1 radial-seller flex items-center justify-center md:justify-end
                          px-6 py-20 md:py-36 md:pr-20 lg:pr-32 relative overflow-hidden">
            <div className="absolute -right-32 -top-32 opacity-[.04] pointer-events-none ring-spin"
                 style={{ width: 500, height: 500 }}>
              <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="250" cy="250" r="240" stroke="#D4A843" strokeWidth="1" strokeDasharray="8 6" />
                <circle cx="250" cy="250" r="190" stroke="#D4A843" strokeWidth="1" strokeDasharray="4 8" />
              </svg>
            </div>
            <div className="max-w-lg text-center md:text-right flex flex-col items-center md:items-end a1">
              <div className="inline-flex items-center gap-2 rounded-full badge px-4 py-1.5 text-xs font-bold mb-8">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Pour les Commerçants &amp; Boutiques B2B
              </div>
              <h1 className="f-display text-4xl sm:text-5xl lg:text-[3.6rem] font-bold leading-[1.05] tracking-tight text-white mb-6">
                Votre cash.<br />
                <span className="gold-text">Sécurisé.</span><br />
                Vos livraisons.<br />
                <span className="gold-text">Maîtrisées.</span>
              </h1>
              <p className="text-base text-gray-400 leading-relaxed mb-10 max-w-sm">
                La plateforme logistique qui unifie suivi GPS, validation PIN et réconciliation financière. Zéro perte. Zéro surprise.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <Link href="/signup-seller"
                  className="btn-gold flex items-center justify-center gap-2.5 rounded-2xl px-7 py-4 text-sm uppercase tracking-widest">
                  Créer mon Espace <Zap className="h-4 w-4" />
                </Link>
                <Link href="#features-seller"
                  className="btn-ghost flex items-center gap-2 rounded-2xl px-6 py-4 text-sm font-bold">
                  Voir les fonctions
                </Link>
              </div>
              <div className="flex items-center gap-1.5 mt-8 opacity-60">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" style={{ color: "var(--gold)" }} />
                ))}
                <span className="text-xs ml-2" style={{ color: "var(--muted)" }}>
                  +120 boutiques abidjanaises
                </span>
              </div>
            </div>
          </div>

          {/* Livreurs */}
          <div className="flex-1 radial-driver flex items-center justify-center md:justify-start
                          px-6 py-20 md:py-36 md:pl-20 lg:pl-32 relative overflow-hidden">
            <div className="absolute -left-32 -bottom-32 opacity-[.04] pointer-events-none ring-rev"
                 style={{ width: 500, height: 500 }}>
              <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="250" cy="250" r="240" stroke="#34d399" strokeWidth="1" strokeDasharray="8 6" />
                <circle cx="250" cy="250" r="190" stroke="#34d399" strokeWidth="1" strokeDasharray="4 8" />
              </svg>
            </div>
            <div className="max-w-lg text-center md:text-left flex flex-col items-center md:items-start a2">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-8"
                   style={{ background: "rgba(52,211,153,.08)", border: "1px solid rgba(52,211,153,.15)", color: "#34d399" }}>
                <Navigation className="h-3.5 w-3.5" />
                Pour les Livreurs Certifiés
              </div>
              <h1 className="f-display text-4xl sm:text-5xl lg:text-[3.6rem] font-bold leading-[1.05] tracking-tight text-white mb-6">
                Vos revenus.<br />
                <span style={{ background: "linear-gradient(135deg,#6ee7b7,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Protégés.
                </span><br />
                Votre carrière.<br />
                <span style={{ background: "linear-gradient(135deg,#6ee7b7,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Construite.
                </span>
              </h1>
              <p className="text-base text-gray-400 leading-relaxed mb-10 max-w-sm">
                PWA mobile ultra-rapide, SocialWallet Paystack, Bourse Globale de courses. Livrez plus, gagnez plus — en toute indépendance.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <Link href="/signup-driver"
                  className="flex items-center justify-center gap-2.5 rounded-2xl px-7 py-4 text-sm font-extrabold uppercase tracking-widest transition-all"
                  style={{ background: "linear-gradient(135deg,#059669,#10b981,#34d399)", color: "#080A0E", boxShadow: "0 0 28px rgba(16,185,129,.25)" }}>
                  Rejoindre la Flotte <Zap className="h-4 w-4" />
                </Link>
                <Link href="#features-driver"
                  className="flex items-center gap-2 rounded-2xl px-6 py-4 text-sm font-bold transition-all"
                  style={{ border: "1px solid rgba(52,211,153,.15)", color: "#34d399" }}>
                  Comment ça marche
                </Link>
              </div>
              <div className="flex items-center gap-1.5 mt-8 opacity-60">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current text-emerald-400" />
                ))}
                <span className="text-xs ml-2" style={{ color: "var(--muted)" }}>
                  +400 livreurs actifs
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ══ BANNER IMAGE ════════════════════════════════════════════════════ */}
        <div className="relative w-full overflow-hidden"
             style={{ height: "clamp(200px, 32vw, 500px)" }}>
          <Image
            src="/bannier.png"
            alt="KoliSync — Logistique connectée et visible en temps réel"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          {/* Fondu haut : blend avec le hero nuit */}
          <div className="absolute inset-x-0 top-0 h-28 pointer-events-none"
               style={{ background: "linear-gradient(to bottom, #080A0E 0%, transparent 100%)" }} />
          {/* Fondu bas : blend avec la bande stats */}
          <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
               style={{ background: "linear-gradient(to top, #0D1017 0%, transparent 100%)" }} />
          {/* Voile latéral gauche subtil */}
          <div className="absolute inset-y-0 left-0 w-20 pointer-events-none"
               style={{ background: "linear-gradient(to right, rgba(8,10,14,.6) 0%, transparent 100%)" }} />
          {/* Voile latéral droit subtil */}
          <div className="absolute inset-y-0 right-0 w-20 pointer-events-none"
               style={{ background: "linear-gradient(to left, rgba(8,10,14,.6) 0%, transparent 100%)" }} />
        </div>

        {/* ══ STATS ════════════════════════════════════════════════════════════ */}
        <section className="a3" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-px"
               style={{ background: "var(--border)" }}>
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col items-center justify-center text-center py-10 px-6"
                   style={{ background: "var(--surface)" }}>
                <p className="stat-val text-4xl md:text-5xl font-bold mb-2">{s.value}</p>
                <p className="text-sm font-bold text-white mb-0.5">{s.label}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FEATURES ═════════════════════════════════════════════════════════ */}
        <section className="py-28 md:py-36" style={{ background: "var(--night)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20 a4">
              <span className="inline-flex items-center gap-2 rounded-full badge px-4 py-1.5 text-xs font-bold mb-6">
                <Package className="h-3.5 w-3.5" /> L&apos;écosystème KoliSync
              </span>
              <h2 className="f-display text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                Une plateforme.<br />
                <span className="gold-text">Deux univers. Un seul objectif.</span>
              </h2>
              <p className="mt-5 text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
                Commerçants et livreurs connectés sur la même infrastructure — pour des livraisons fluides, sécurisées et transparentes.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 a5">
              <div id="features-seller" className="koli-card rounded-3xl p-8 md:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 rounded-2xl feat-icon-seller flex items-center justify-center">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white">KoliSync Commerçants</p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>Dashboard B2B · Abonnement Pro</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                  {sellerFeatures.map((f, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="h-9 w-9 shrink-0 rounded-xl feat-icon-seller flex items-center justify-center mt-0.5">
                        <f.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{f.title}</p>
                        <p className="text-xs leading-relaxed mt-1" style={{ color: "var(--muted)" }}>{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-10 pt-7" style={{ borderTop: "1px solid var(--border)" }}>
                  <Link href="/signup-seller"
                    className="btn-gold inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm uppercase tracking-wide">
                    Démarrer gratuitement <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div id="features-driver" className="koli-card rounded-3xl p-8 md:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 rounded-2xl feat-icon-driver flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white">KoliSync Livreurs</p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>PWA Mobile · SocialWallet</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                  {driverFeatures.map((f, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="h-9 w-9 shrink-0 rounded-xl feat-icon-driver flex items-center justify-center mt-0.5">
                        <f.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{f.title}</p>
                        <p className="text-xs leading-relaxed mt-1" style={{ color: "var(--muted)" }}>{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-10 pt-7" style={{ borderTop: "1px solid var(--border)" }}>
                  <Link href="/signup-driver"
                    className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-extrabold uppercase tracking-wide transition-all"
                    style={{ background: "linear-gradient(135deg,#059669,#34d399)", color: "#080A0E" }}>
                    Rejoindre la flotte <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ TRUST ════════════════════════════════════════════════════════════ */}
        <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }} className="py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Lock className="h-8 w-8 mx-auto mb-6" style={{ color: "var(--gold)" }} />
            <h3 className="f-display text-2xl md:text-4xl font-bold text-white mb-5 tracking-tight">
              Conçu pour la <span className="gold-text">confiance</span>.
            </h3>
            <p className="text-gray-400 text-base leading-relaxed max-w-2xl mx-auto mb-12">
              Chaque transaction est traçable, chaque FCFA est compté. KoliSync est la première plateforme logistique d&apos;Afrique de l&apos;Ouest à intégrer nativement la gestion financière, le suivi GPS et la protection sociale des livreurs en un seul système.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Validation par PIN unique", "Réconciliation automatique", "SocialWallet Paystack", "Bourse Globale certifiée", "Données hébergées en Afrique"].map((t, i) => (
                <span key={i} className="badge inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold">
                  <CheckCircle2 className="h-3 w-3" /> {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FINAL CTA ════════════════════════════════════════════════════════ */}
        <section className="py-28 relative overflow-hidden" style={{ background: "var(--night)" }}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div style={{ width: 800, height: 400, background: "radial-gradient(ellipse, rgba(212,168,67,.07) 0%, transparent 70%)", borderRadius: "50%" }} />
          </div>
          <div className="max-w-3xl mx-auto px-6 text-center relative">
            <p className="text-xs font-bold uppercase tracking-[.25em] mb-4" style={{ color: "var(--gold)" }}>
              Prêt à rejoindre l&apos;écosystème ?
            </p>
            <h2 className="f-display text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-8">
              La logistique<br />
              <span className="gold-text">intelligente</span> commence ici.
            </h2>
            <p className="text-gray-400 mb-12 text-base leading-relaxed max-w-xl mx-auto">
              Rejoignez les centaines de commerçants et livreurs qui font confiance à KoliSync pour leurs opérations quotidiennes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup-seller"
                className="btn-gold flex items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-sm uppercase tracking-widest">
                Je suis Commerçant <Zap className="h-4 w-4" />
              </Link>
              <Link href="/signup-driver"
                className="btn-ghost flex items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-sm font-bold uppercase tracking-widest">
                Je suis Livreur <Navigation className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
        <footer style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg overflow-hidden relative"
                     style={{ boxShadow: "0 0 12px rgba(212,168,67,.2)", border: "1px solid rgba(212,168,67,.15)" }}>
                  <Image src="/logo.png" alt="KoliSync" fill className="object-contain p-1" />
                </div>
                <div>
                  <p className="f-display font-bold text-white text-sm">KoliSync</p>
                  <p className="text-[10px]" style={{ color: "var(--muted)" }}>La logistique transparente · Côte d&apos;Ivoire</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs font-medium" style={{ color: "var(--muted)" }}>
                <Link href="/terms"   className="hover:text-white transition-colors">CGU</Link>
                <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
                <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              </div>

              {/* Made by webappci.com */}
              <div className="flex flex-col items-center md:items-end gap-1.5">
                <p className="text-[10px] font-bold uppercase tracking-[.2em]" style={{ color: "var(--muted)" }}>
                  Conçu &amp; développé par
                </p>
                <a href="https://www.webappci.com" target="_blank" rel="noopener noreferrer"
                   className="group flex items-center gap-2 transition-all hover:opacity-80">
                  <span className="f-display text-base font-bold text-white"
                        style={{ transition: "background .2s" }}>
                    webappci.com
                  </span>
                  <span className="badge inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <Globe2 className="h-2.5 w-2.5" /> Abidjan, CI
                  </span>
                </a>
                <p className="text-[10px]" style={{ color: "var(--muted)" }}>
                  © {new Date().getFullYear()} KoliSync. Tous droits réservés.
                </p>
              </div>

            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
