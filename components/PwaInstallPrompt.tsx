"use client";

import { useState, useEffect } from "react";
import { Download, Share, X, PlusSquare, Zap } from "lucide-react";

interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

export default function PwaInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as NavigatorStandalone).standalone;

    if (isStandalone) return;

    const hasDismissed = localStorage.getItem("pwa_prompt_dismissed");
    if (hasDismissed) return;

    const ua = window.navigator.userAgent.toLowerCase();
    const isMobile = /android|iphone|ipad|ipod/.test(ua);

    if (isMobile) {
      setIsIOS(/iphone|ipad|ipod/.test(ua));
      const timer = setTimeout(() => setShowPrompt(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!showPrompt) return null;

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa_prompt_dismissed", "true");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .f-display { font-family: 'Clash Display', sans-serif; }
        .f-body    { font-family: 'Plus Jakarta Sans', sans-serif; }

        @keyframes pwaSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        .pwa-enter { animation: pwaSlideUp .45s cubic-bezier(.22,1,.36,1) both; }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .pwa-icon-shimmer {
          background: linear-gradient(110deg, #A07820 0%, #D4A843 30%, #F0C96A 50%, #D4A843 70%, #A07820 100%);
          background-size: 200% auto;
          animation: shimmer 3.5s linear infinite;
        }

        @keyframes iconPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(212,168,67,.5); }
          60%     { box-shadow: 0 0 0 10px transparent; }
        }
        .pwa-icon-pulse { animation: iconPulse 2.8s ease-in-out infinite; }

        .pwa-close {
          color: #4B5563;
          transition: color .2s, background .2s;
          border-radius: 50%;
        }
        .pwa-close:hover { color: white; background: rgba(255,255,255,.07); }

        .pwa-step {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: rgba(212,168,67,.1);
          border: 1px solid rgba(212,168,67,.18);
          color: #D4A843;
          border-radius: 6px;
          padding: 1px 6px;
          font-weight: 700;
          font-size: 11px;
          vertical-align: middle;
          margin: 0 2px;
          white-space: nowrap;
        }
      `}</style>

      <div className="pwa-enter fixed bottom-4 left-4 right-4 z-50 f-body">
        <div
          className="relative overflow-hidden rounded-3xl p-5"
          style={{
            background: "linear-gradient(135deg, #111620 0%, #0D1017 100%)",
            border: "1px solid rgba(212,168,67,.15)",
            boxShadow: "0 24px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(212,168,67,.05), inset 0 1px 0 rgba(255,255,255,.03)",
          }}
        >
          {/* Inner glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 80% 60% at 50% 120%, rgba(212,168,67,.06) 0%, transparent 70%)",
            }}
          />

          {/* Close */}
          <button
            onClick={dismissPrompt}
            aria-label="Fermer"
            className="pwa-close absolute top-3.5 right-3.5 p-1.5 transition-all"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative flex items-start gap-4 pr-8">

            {/* Icon */}
            <div className="pwa-icon-pulse shrink-0">
              <div
                className="pwa-icon-shimmer h-14 w-14 rounded-2xl flex items-center justify-center"
                style={{ boxShadow: "0 4px 20px rgba(212,168,67,.25)" }}
              >
                <Download className="h-6 w-6" style={{ color: "#080A0E" }} strokeWidth={2.5} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ background: "rgba(212,168,67,.08)", border: "1px solid rgba(212,168,67,.12)", color: "#D4A843" }}
              >
                <Zap className="h-2.5 w-2.5" />
                Application disponible
              </div>

              <h3 className="f-display text-base font-bold text-white leading-tight mb-2">
                Installez KoliSync
              </h3>

              {isIOS ? (
                <p className="text-xs leading-relaxed" style={{ color: "#9ca3af" }}>
                  Appuyez sur{" "}
                  <span className="pwa-step">
                    <Share className="h-2.5 w-2.5" /> Partager
                  </span>{" "}
                  en bas, puis{" "}
                  <span className="pwa-step">
                    <PlusSquare className="h-2.5 w-2.5" /> Sur l&apos;écran d&apos;accueil
                  </span>
                </p>
              ) : (
                <p className="text-xs leading-relaxed" style={{ color: "#9ca3af" }}>
                  Appuyez sur les{" "}
                  <span className="pwa-step">⋮ 3 points</span>{" "}
                  du navigateur, puis sélectionnez{" "}
                  <span className="pwa-step">Installer l&apos;app</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
