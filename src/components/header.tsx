import { useEffect } from "react";

export function Header() {
  useEffect(() => {
    const nav = document.getElementById("navbar");
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 50) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav id="navbar" className="navbar" aria-label="Navegação principal">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <a href="#" className="flex items-center gap-3 select-none" aria-label="ClipMaker Home">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center btn-primary shrink-0"
            style={{ boxShadow: "0 4px 16px rgba(99,102,241,.4)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <span className="font-bold text-white tracking-tight text-[1.05rem]">ClipMaker</span>
          <span
            className="hidden sm:inline px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase rounded-full text-indigo-300"
            style={{ background: "rgba(99,102,241,.12)", border: "1px solid rgba(99,102,241,.25)" }}
          >
            AI Beta
          </span>
        </a>

        {/* Links */}
        <div className="hidden md:flex items-center gap-7">
          <a href="#features" className="text-[.85rem] text-slate-400 hover:text-white transition-colors duration-200">Como funciona</a>
          <a href="#app"      className="text-[.85rem] text-slate-400 hover:text-white transition-colors duration-200">Usar agora</a>
        </div>

        <a href="#app" className="btn-primary px-5 py-2 rounded-xl text-sm font-semibold text-white">
          Começar grátis
        </a>
      </div>
    </nav>
  );
}
