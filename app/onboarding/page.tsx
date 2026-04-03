"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Globe2, ShieldCheck, Wallet, ArrowRight, Zap } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    icon: Globe2,
    accent: "#60a5fa",
    accentBg: "rgba(59,130,246,.1)",
    accentBorder: "rgba(59,130,246,.15)",
    tag: "Opportunités · Réseau",
    title: "La Bourse\nGlobale",
    highlight: "Globale",
    highlightColor: "linear-gradient(135deg,#93c5fd,#3b82f6)",
    description:
      "Commerçants, trouvez un livreur en 2 minutes. Livreurs, accédez à des dizaines d'opportunités autour de vous sur le Radar public.",
  },
  {
    id: 2,
    icon: ShieldCheck,
    accent: "#34d399",
    accentBg: "rgba(16,185,129,.1)",
    accentBorder: "rgba(16,185,129,.15)",
    tag: "GPS · Code PIN",
    title: "Sécurité &\nPreuve GPS",
    highlight: "GPS",
    highlightColor: "linear-gradient(135deg,#6ee7b7,#10b981)",
    description:
      "Fini les litiges et les clients fantômes. Chaque livraison est validée par un Code PIN secret et vérifiée par un géofencing GPS à 10 mètres.",
  },
  {
    id: 3,
    icon: Wallet,
    accent: "#D4A843",
    accentBg: "rgba(212,168,67,.1)",
    accentBorder: "rgba(212,168,67,.15)",
    tag: "Cash · COD · Smart Wallet",
    title: "Portefeuille\nIntelligent",
    highlight: "Intelligent",
    highlightColor: "linear-gradient(135deg,#F0C96A,#D4A843)",
    description:
      "Encaissez le cash (COD) en toute sérénité. Votre Smart Wallet vous protège avec un plafond de sécurité et gère vos cautions automatiquement.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const hasOnboarded = localStorage.getItem("kolisync_onboarded");
    if (hasOnboarded) router.push("/");
  }, [router]);

  if (!isMounted) return null;

  const goTo = (index: number) => {
    if (animating || index === currentSlide) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setAnimating(false);
    }, 260);
  };

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      goTo(currentSlide + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem("kolisync_onboarded", "true");
    router.push("/");
  };

  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;
  const isLast = currentSlide === SLIDES.length - 1;

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
          --muted:   #4B5563;
        }

        .f-display { font-family: 'Clash Display', sans-serif; }
        .f-body    { font-family: 'Plus Jakarta Sans', sans-serif; }

        /* Grain */
        .ob-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 9999;
          mix-blend-mode: overlay;
        }

        /* Slide in/out */
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(22px) scale(.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateY(0)     scale(1); }
          to   { opacity: 0; transform: translateY(-16px) scale(.98); }
        }
        .slide-enter { animation: slideIn .35s cubic-bezier(.22,1,.36,1) both; }
        .slide-exit  { animation: slideOut .25s ease both; }

        /* Icon pulse */
        @keyframes iconPulse {
          0%,100% { box-shadow: 0 0 0 0 var(--accent-color, rgba(212,168,67,.4)); }
          50%      { box-shadow: 0 0 0 14px transparent; }
        }
        .icon-pulse { animation: iconPulse 2.6s ease-in-out infinite; }

        /* Orbit ring */
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .ring-anim { animation: spin-slow 14s linear infinite; }

        /* Gold shimmer button */
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
          transition: box-shadow .25s, transform .15s;
        }
        .btn-gold:hover  { box-shadow: 0 0 40px 6px rgba(212,168,67,.3); transform: translateY(-1px); }
        .btn-gold:active { transform: scale(.97); }

        /* Ghost */
        .btn-ghost {
          border: 1px solid var(--border);
          color: var(--gold);
          transition: background .2s, border-color .2s, transform .15s;
        }
        .btn-ghost:hover { background: rgba(212,168,67,.06); border-color: rgba(212,168,67,.3); }

        /* Progress dot pill */
        .dot-active {
          background: var(--gold);
          box-shadow: 0 0 10px rgba(212,168,67,.5);
        }
        .dot-inactive {
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.06);
        }

        /* Scrollbar */
        * { scrollbar-width: thin; scrollbar-color: #1a1e2a transparent; }
      `}</style>

      <div className="ob-root f-body flex flex-col min-h-screen min-h-dvh relative overflow-hidden"
           style={{ background: "var(--night)", color: "#e8dcc8" }}>

        {/* ── Background radial glow (changes with slide) ── */}
        <div className="absolute inset-0 pointer-events-none transition-all duration-700"
             style={{ background: `radial-gradient(ellipse 70% 50% at 50% 60%, ${slide.accentBg} 0%, transparent 70%)` }} />

        {/* ── Orbit ring (decorative) ── */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[.03] ring-anim"
             style={{ width: 520, height: 520 }}>
          <svg viewBox="0 0 520 520" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="260" cy="260" r="250" stroke={slide.accent} strokeWidth="1" strokeDasharray="10 8" />
            <circle cx="260" cy="260" r="200" stroke={slide.accent} strokeWidth="1" strokeDasharray="4 10" />
            <circle cx="260" cy="260" r="150" stroke={slide.accent} strokeWidth="1" strokeDasharray="2 12" />
          </svg>
        </div>

        {/* ── HEADER ── */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-12 pb-2">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl overflow-hidden relative shrink-0"
                 style={{ border: "1px solid var(--border)", boxShadow: "0 0 12px rgba(212,168,67,.2)" }}>
              <Image src="/logo.png" alt="KoliSync" fill className="object-contain p-1" />
            </div>
            <span className="f-display text-sm font-bold text-white">KoliSync</span>
          </div>

          {/* Skip */}
          <button onClick={completeOnboarding}
                  className="f-body text-[11px] font-bold uppercase tracking-[.18em] transition-colors"
                  style={{ color: "var(--muted)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "white")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}>
            Passer
          </button>
        </div>

        {/* ── SLIDE CONTENT ── */}
        <div className={`relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center
                         ${animating ? "slide-exit" : "slide-enter"}`}
             key={slide.id}>

          {/* Tag */}
          <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-bold mb-8 tracking-wide"
               style={{ background: slide.accentBg, border: `1px solid ${slide.accentBorder}`, color: slide.accent }}>
            {slide.tag}
          </div>

          {/* Icon container */}
          <div className="relative mb-10">
            {/* Outer ring glow */}
            <div className="absolute inset-0 rounded-full icon-pulse"
                 style={{ "--accent-color": `${slide.accent}4D` } as React.CSSProperties} />
            <div className="h-28 w-28 rounded-full flex items-center justify-center relative"
                 style={{
                   background: slide.accentBg,
                   border: `1px solid ${slide.accentBorder}`,
                   boxShadow: `0 0 32px ${slide.accent}30`,
                 }}>
              <Icon style={{ color: slide.accent, width: 52, height: 52 }} strokeWidth={1.5} />
            </div>
          </div>

          {/* Title */}
          <h1 className="f-display text-[2.6rem] leading-[1.05] font-bold text-white mb-5 tracking-tight whitespace-pre-line">
            {slide.title.split(slide.highlight).map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span style={{ background: slide.highlightColor, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {slide.highlight}
                  </span>
                )}
              </span>
            ))}
          </h1>

          {/* Description */}
          <p className="f-body text-sm leading-relaxed max-w-xs" style={{ color: "#9ca3af" }}>
            {slide.description}
          </p>
        </div>

        {/* ── FOOTER ── */}
        <div className="relative z-10 px-6 pb-12 pt-6 flex flex-col items-center gap-8">

          {/* Progress dots */}
          <div className="flex items-center gap-2.5">
            {SLIDES.map((s, i) => (
              <button key={s.id} onClick={() => goTo(i)}
                      className={`rounded-full transition-all duration-400 ${
                        i === currentSlide ? "w-8 h-2 dot-active" : "w-2 h-2 dot-inactive"
                      }`} />
            ))}
          </div>

          {/* Step counter */}
          <p className="f-body text-[11px] font-bold uppercase tracking-[.2em]"
             style={{ color: "var(--muted)" }}>
            {currentSlide + 1} / {SLIDES.length}
          </p>

          {/* CTA button */}
          <button onClick={nextSlide}
                  className={`w-full max-w-sm py-[18px] rounded-2xl text-sm uppercase tracking-widest
                              flex items-center justify-center gap-3 transition-all
                              ${isLast ? "btn-gold" : ""}`}
                  style={!isLast ? {
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    color: "white",
                    fontWeight: 700,
                  } : undefined}>
            {isLast ? (
              <>
                <Zap className="h-4 w-4" style={{ color: "#080A0E" }} />
                Commencer l&apos;aventure
                <ArrowRight className="h-4 w-4" style={{ color: "#080A0E" }} />
              </>
            ) : (
              <>
                Continuer
                <ArrowRight className="h-4 w-4" style={{ color: slide.accent }} />
              </>
            )}
          </button>

          {/* Déjà un compte */}
          <button onClick={completeOnboarding}
                  className="f-body text-[11px] font-medium transition-colors"
                  style={{ color: "var(--muted)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "white")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}>
            Déjà un compte ?{" "}
            <span style={{ color: "var(--gold)", fontWeight: 700 }}>Se connecter</span>
          </button>
        </div>

      </div>
    </>
  );
}
