import AdminNavbar from "@/components/admin/AdminNavbar";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        :root { --cyan: #06b6d4; --amber: #f59e0b; --red: #ef4444; --green: #10b981; --violet: #8b5cf6; }
        .f-display { font-family: 'Syne', sans-serif; }
        .f-mono    { font-family: 'JetBrains Mono', monospace; }
        .f-body    { font-family: 'DM Sans', sans-serif; }
        .hq-grid { background-image: linear-gradient(rgba(6,182,212,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,.025) 1px, transparent 1px); background-size: 48px 48px; }
        @keyframes scanline { 0% { top: -2px; } 100% { top: 100%; } }
        .scan-wrap { position: relative; overflow: hidden; }
        .scan-wrap::after { content: ''; position: absolute; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(6,182,212,.35), transparent); animation: scanline 6s linear infinite; pointer-events: none; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .a1 { animation: fadeUp .45s ease both; } .a2 { animation: fadeUp .45s ease .06s both; } .a3 { animation: fadeUp .45s ease .12s both; } .a4 { animation: fadeUp .45s ease .18s both; }
        .card { transition: box-shadow .25s ease, border-color .25s ease; }
        .card:hover { box-shadow: 0 0 28px 2px rgba(6,182,212,.07); border-color: rgba(6,182,212,.25) !important; }
        .audit-scroll { scrollbar-width: thin; scrollbar-color: #1e293b transparent; }
        .audit-scroll::-webkit-scrollbar { width: 4px; }
        .audit-scroll::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        .pill-success { background: rgba(16,185,129,.12); color: #10b981; border: 1px solid rgba(16,185,129,.25); }
        .pill-alert   { background: rgba(239,68,68,.12);  color: #ef4444; border: 1px solid rgba(239,68,68,.25); }
        .pill-neutral { background: rgba(71,85,105,.25);  color: #94a3b8; border: 1px solid rgba(71,85,105,.3); }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .bar-shimmer { background: linear-gradient(90deg, #06b6d4 0%, #818cf8 50%, #06b6d4 100%); background-size: 200% auto; animation: shimmer 3s linear infinite; }
      `}</style>

      <div className="min-h-screen bg-gray-950 text-slate-50 f-body hq-grid selection:bg-cyan-500/20">
        <AdminNavbar />
        {children}
      </div>
    </>
  );
}
