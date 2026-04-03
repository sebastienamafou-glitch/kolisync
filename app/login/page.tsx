"use client";

import { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2, Zap, ShieldCheck, Globe2 } from "lucide-react";
import { loginAction } from "@/app/actions/auth";

// ── SUBMIT BUTTON ─────────────────────────────────────────────────────────────
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-gold-login relative w-full flex items-center justify-center gap-2.5 rounded-2xl py-[18px] text-sm uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[.97]"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#080A0E" }} />
          <span style={{ color: "#080A0E" }}>Connexion…</span>
        </>
      ) : (
        <>
          <Zap className="h-4 w-4" style={{ color: "#080A0E" }} />
          <span style={{ color: "#080A0E", fontWeight: 800 }}>Se connecter</span>
        </>
      )}
    </button>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [showPin, setShowPin] = useState(false);
  const [state, formAction] = useActionState(loginAction, null);

  // 🚨 DÉTECTION & REDIRECTION VERS L'ONBOARDING
  useEffect(() => {
    const hasOnboarded = localStorage.getItem("kolisync_onboarded");
    if (!hasOnboarded) {
      router.push("/onboarding");
    }
  }, [router]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800&display=swap');

        :root {
          --gold:    #D4A843;
          --gold-lt: #F0C96A;
          --gold-dk: #A07820;
          --night:   #080A0E;
          --surface: #0D1017;
          --card:    #111620;
          --border:  rgba(212,168,67,.13);
          --muted:   #4B5563;
          --text:    #E8DCC8;
        }

        .f-display { font-family: 'Clash Display', sans-serif; }
        .f-body    { font-family: 'Plus Jakarta Sans', sans-serif; }

        /* Grain */
        .login-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 9999; mix-blend-mode: overlay;
        }

        /* Fade up */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .a1 { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) both; }
        .a2 { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) .08s both; }
        .a3 { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) .16s both; }
        .a4 { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) .24s both; }

        /* Error shake */
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%,60% { transform: translateX(-5px); }
          40%,80% { transform: translateX(5px); }
        }
        .shake { animation: shake .35s ease both; }

        /* Gold shimmer button */
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .btn-gold-login {
          background: linear-gradient(110deg, #A07820 0%, #D4A843 30%, #F0C96A 50%, #D4A843 70%, #A07820 100%);
          background-size: 200% auto;
          animation: shimmer 4s linear infinite;
          box-shadow: 0 0 28px rgba(212,168,67,.2);
          transition: box-shadow .25s, transform .15s;
        }
        .btn-gold-login:not(:disabled):hover {
          box-shadow: 0 0 44px rgba(212,168,67,.35);
          transform: translateY(-1px);
        }

        /* Input */
        .koli-input {
          width: 100%;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 14px;
          padding: 15px 18px;
          color: white;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
          -webkit-appearance: none;
        }
        .koli-input::placeholder { color: #374151; }
        .koli-input:focus {
          border-color: rgba(212,168,67,.4);
          box-shadow: 0 0 0 3px rgba(212,168,67,.08);
          background: rgba(255,255,255,.04);
        }
        .koli-input.pin {
          letter-spacing: .45em;
          font-weight: 800;
          padding-right: 52px;
        }

        /* Input label */
        .koli-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .14em;
          color: #6B7280;
          margin-bottom: 8px;
        }

        /* Error banner */
        .error-banner {
          background: rgba(239,68,68,.08);
          border: 1px solid rgba(239,68,68,.2);
          border-radius: 14px;
          padding: 12px 16px;
          color: #fca5a5;
          font-size: 13px;
          font-weight: 600;
        }

        /* Link hover */
        .koli-link {
          color: var(--gold);
          font-weight: 700;
          transition: opacity .15s;
        }
        .koli-link:hover { opacity: .7; }

        /* Divider text */
        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,.05);
        }

        /* Footer links */
        .footer-link {
          color: #374151;
          font-size: 11px;
          font-weight: 600;
          transition: color .15s;
        }
        .footer-link:hover { color: var(--gold); }

        /* Eye btn */
        .eye-btn {
          position: absolute; right: 0; top: 0; bottom: 0;
          display: flex; align-items: center;
          padding: 0 16px;
          color: #4B5563;
          transition: color .2s;
        }
        .eye-btn:hover { color: var(--gold); }

        /* Card */
        .login-card {
          background: linear-gradient(160deg, #111620 0%, #0D1017 100%);
          border: 1px solid var(--border);
          border-radius: 28px;
          box-shadow:
            0 32px 80px rgba(0,0,0,.7),
            0 0 0 1px rgba(212,168,67,.04),
            inset 0 1px 0 rgba(255,255,255,.03);
        }

        /* Orbit ring */
        @keyframes spin-slow { from { transform: rotate(0deg);  } to { transform: rotate(360deg);  } }
        @keyframes spin-rev  { from { transform: rotate(0deg);  } to { transform: rotate(-360deg); } }
        .ring1 { animation: spin-slow 20s linear infinite; }
        .ring2 { animation: spin-rev  28s linear infinite; }

        /* Scrollbar */
        * { scrollbar-width: thin; scrollbar-color: #1a1e2a transparent; }
      `}</style>

      <main
        className="login-root f-body flex min-h-screen min-h-dvh flex-col items-center justify-center px-5 py-12 relative overflow-hidden"
        style={{ background: "var(--night)" }}
      >
        {/* ── Background glow ── */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: "radial-gradient(ellipse 70% 50% at 50% 55%, rgba(212,168,67,.055) 0%, transparent 68%)" }} />

        {/* ── Orbit rings ── */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[.025] ring1"
             style={{ width: 600, height: 600 }}>
          <svg viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="300" cy="300" r="290" stroke="#D4A843" strokeWidth="1" strokeDasharray="10 8" />
            <circle cx="300" cy="300" r="230" stroke="#D4A843" strokeWidth="1" strokeDasharray="4 10" />
          </svg>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[.015] ring2"
             style={{ width: 400, height: 400 }}>
          <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="200" r="190" stroke="#D4A843" strokeWidth="1" strokeDasharray="6 12" />
          </svg>
        </div>

        {/* ── Card ── */}
        <div className="login-card relative z-10 w-full max-w-sm px-8 py-10">

          {/* Inner glow */}
          <div className="absolute inset-0 rounded-[28px] pointer-events-none"
               style={{ background: "radial-gradient(ellipse 90% 50% at 50% 110%, rgba(212,168,67,.05) 0%, transparent 70%)" }} />

          {/* ── Logo + Titre ── */}
          <div className="relative flex flex-col items-center mb-10 a1">
            <div className="relative h-14 w-36 mb-5">
              <Image
                src="/logo-kolisync.png"
                alt="KoliSync"
                fill
                sizes="144px"
                className="object-contain"
                priority
              />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-4"
                 style={{ background: "rgba(212,168,67,.08)", border: "1px solid rgba(212,168,67,.12)", color: "var(--gold)" }}>
              <ShieldCheck className="h-2.5 w-2.5" /> Accès sécurisé
            </div>

            <h1 className="f-display text-2xl font-bold text-white tracking-tight text-center leading-tight">
              Bienvenue
            </h1>
            <p className="text-xs mt-2 text-center" style={{ color: "#6B7280" }}>
              Connectez-vous à votre espace KoliSync
            </p>
          </div>

          {/* ── Form ── */}
          <form action={formAction} className="relative space-y-5 a2">

            {/* Error */}
            {state?.error && (
              <div className="error-banner shake">
                {state.error}
              </div>
            )}

            {/* Téléphone */}
            <div>
              <label htmlFor="identifier" className="koli-label">
                Numéro de téléphone
              </label>
              <input
                type="text"
                id="identifier"
                name="identifier"
                autoComplete="tel"
                inputMode="tel"
                className="koli-input"
                placeholder="Ex : 0100 000 001"
                required
              />
            </div>

            {/* PIN */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="pin" className="koli-label" style={{ marginBottom: 0 }}>
                  Code PIN secret
                </label>
                <Link href="#" className="text-[11px] font-bold transition-colors"
                      style={{ color: "var(--muted)" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}>
                  Code oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  id="pin"
                  name="pin"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  minLength={4}
                  maxLength={4}
                  autoComplete="current-password"
                  className="koli-input pin"
                  placeholder="••••"
                  required
                />
                <button
                  type="button"
                  aria-label={showPin ? "Masquer le PIN" : "Afficher le PIN"}
                  className="eye-btn"
                  onClick={() => setShowPin(v => !v)}
                >
                  {showPin
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye    className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-1 a3">
              <SubmitButton />
            </div>
          </form>

          {/* ── Inscription ── */}
          <div className="relative mt-8 a4">
            <div className="flex items-center gap-3 mb-5">
              <div className="divider-line" />
              <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
                    style={{ color: "var(--muted)" }}>
                Pas encore inscrit ?
              </span>
              <div className="divider-line" />
            </div>

            <div className="space-y-2.5">
              <Link href="/register"
                className="flex items-center justify-between w-full rounded-2xl px-5 py-3.5 transition-all group"
                style={{ background: "rgba(59,130,246,.06)", border: "1px solid rgba(59,130,246,.12)" }}>
                <div>
                  <p className="text-sm font-bold text-white leading-none">Espace Commerçant</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>Boutique · Dashboard B2B</p>
                </div>
                <span className="text-xs font-bold" style={{ color: "#60a5fa" }}>→</span>
              </Link>

              <Link href="/register-driver"
                className="flex items-center justify-between w-full rounded-2xl px-5 py-3.5 transition-all group"
                style={{ background: "rgba(16,185,129,.06)", border: "1px solid rgba(16,185,129,.12)" }}>
                <div>
                  <p className="text-sm font-bold text-white leading-none">Rejoindre la Flotte</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>Livreur · SocialWallet</p>
                </div>
                <span className="text-xs font-bold" style={{ color: "#34d399" }}>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="relative z-10 mt-8 flex items-center gap-4">
          <Link href="/cgu"     className="footer-link">CGU</Link>
          <span style={{ color: "#1f2937" }}>·</span>
          <Link href="/privacy" className="footer-link">Confidentialité</Link>
          <span style={{ color: "#1f2937" }}>·</span>
          <a href="https://www.webappci.com" target="_blank" rel="noopener noreferrer"
             className="footer-link flex items-center gap-1">
            <Globe2 className="h-2.5 w-2.5" /> webappci.com
          </a>
        </div>

      </main>
    </>
  );
}
