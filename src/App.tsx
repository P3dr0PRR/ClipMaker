import { useEffect, useRef, useState } from "react";
import { Header } from "./components/header";
import { Button } from "./components/Button";
import { APIKeyInput } from "./components/APIKeyInput";
import { buildTranscriptionURL, fetchTranscription } from "./components/transcription";
import { getViralMoment } from "./components/gemini";

/* ── Toast helper ───────────────────────────────────── */
let toastTimer: ReturnType<typeof setTimeout>;
function showToast(msg: string) {
  const el = document.getElementById("toast");
  if (!el) return;
  clearTimeout(toastTimer);
  el.textContent = msg;
  el.classList.add("show");
  toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
}

/* ── GSAP type shim ─────────────────────────────────── */
declare const gsap: {
  registerPlugin: (...args: unknown[]) => void;
  timeline: (opts?: object) => {
    to: (t: unknown, v: object, pos?: string) => ReturnType<typeof gsap.timeline>;
  };
  set: (t: unknown, v: object) => void;
  to:  (t: unknown, v: object) => void;
  fromTo: (t: unknown, from: object, to: object) => void;
  utils: { toArray: <T = Element>(s: string) => T[] };
};
declare const ScrollTrigger: unknown;

export function App() {
  const [transcription, setTranscription] = useState("");
  const [status, setStatus]               = useState("");
  const [progress, setProgress]           = useState(0);
  const [statusState, setStatusState]     = useState<"idle" | "loading" | "success" | "error">("idle");
  const [videoSrc, setVideoSrc]           = useState("");
  const [apiKey, setApiKey]               = useState("");
  const apiKeyRef = useRef<HTMLInputElement>(null);

  /* ── GSAP animations on mount ── */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const heroItems = ["#hero-badge", "#hero-title", "#hero-sub", "#hero-stats", "#app-card"];
    gsap.set(heroItems, { opacity: 0, y: 36 });

    gsap.timeline({ delay: 0.15 })
      .to("#hero-badge",  { opacity: 1, y: 0, duration: .65, ease: "power2.out" })
      .to("#hero-title",  { opacity: 1, y: 0, duration: .7,  ease: "power2.out" }, "-=.35")
      .to("#hero-sub",    { opacity: 1, y: 0, duration: .6,  ease: "power2.out" }, "-=.4")
      .to("#hero-stats",  { opacity: 1, y: 0, duration: .55, ease: "power2.out" }, "-=.35")
      .to("#app-card",    { opacity: 1, y: 0, duration: .6,  ease: "power2.out" }, "-=.25");

    // Scroll reveal for feature cards
    gsap.utils.toArray<Element>(".bento").forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: .6, ease: "power2.out",
          delay: (i % 3) * .09,
          scrollTrigger: { trigger: card, start: "top 88%" },
        } as object,
      );
    });

    // Scroll reveal section headers
    gsap.utils.toArray<Element>(".section-reveal").forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: .6, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%" } } as object,
      );
    });
  }, []);

  /* ── Status helpers ── */
  function updateStatus(msg: string, pct: number, state: "loading" | "success" | "error" = "loading") {
    setStatus(msg);
    setProgress(pct);
    setStatusState(state);
  }

  /* ── Upload pipeline ── */
  async function handleUpload(info: { public_id: string }): Promise<string | undefined> {
    setTranscription("");
    setVideoSrc("");
    const url = buildTranscriptionURL(info.public_id);
    const maxAttempts = 40;
    const delay       = 15_000;
    const initialWait = 60_000;

    updateStatus("Processando áudio…", 5);
    await sleep(initialWait);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const pct = Math.min(5 + (attempt / maxAttempts) * 52, 57);
      updateStatus(`Aguardando transcrição… (${attempt}/${maxAttempts})`, pct);

      try {
        const response = await fetch(url, { cache: "no-store" });
        if (response.ok) {
          const text = await fetchTranscription(url);
          setTranscription(text);

          updateStatus("Analisando com Gemini AI…", 68);
          const viralParam = await getViralMoment(text, apiKey);

          updateStatus("Gerando clipe final…", 90);
          const videoUrl = `https://res.cloudinary.com/duglttn5l/video/upload/${viralParam}/${info.public_id}.mp4`;
          setVideoSrc(videoUrl);
          updateStatus("Clipe viral gerado com sucesso!", 100, "success");

          return viralParam;
        }
      } catch (err) {
        console.error("Tentativa", attempt, err);
      }

      await sleep(delay);
    }

    updateStatus("Transcrição não encontrada. Tente novamente.", 100, "error");
  }

  function sleep(ms: number) {
    return new Promise<void>((r) => setTimeout(r, ms));
  }

  const showStatus = status !== "";

  return (
    <div className="bg-scene min-h-screen text-white">
      {/* Ambient orbs */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />

      {/* Toast */}
      <div id="toast" className="toast" role="status" aria-live="polite" />

      {/* Navbar */}
      <Header />

      {/* ═══ HERO ═══ */}
      <header className="pt-36 pb-24 px-6 text-center relative">
        <div className="max-w-4xl mx-auto">

          <div id="hero-badge" className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[.8rem] text-indigo-300 mb-8 cursor-default select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 pulse-dot shrink-0" />
            Powered by Gemini 2.5 Flash&nbsp;+&nbsp;Cloudinary
            {/* sparkles */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
          </div>

          <h1 id="hero-title" className="text-[clamp(2.8rem,8vw,5.5rem)] font-black tracking-tight leading-[1.04] mb-7">
            <span className="text-white">Encontre o momento</span><br />
            <span className="g-text">viral do seu vídeo</span>
          </h1>

          <p id="hero-sub" className="text-[1.05rem] text-slate-400 max-w-2xl mx-auto mb-14 leading-relaxed">
            Faça upload do seu vídeo ou áudio. Nossa IA analisa a transcrição, identifica o segmento mais impactante e gera o clipe de 30–60&nbsp;s automaticamente.
          </p>

          <div id="hero-stats" className="flex items-center justify-center gap-6 sm:gap-12 flex-wrap">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">30–60s</div>
              <div className="text-[.72rem] text-slate-500 mt-1 uppercase tracking-wider">Duração ideal</div>
            </div>
            <div className="w-px h-10 bg-white/10 hidden sm:block" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">Gemini&nbsp;AI</div>
              <div className="text-[.72rem] text-slate-500 mt-1 uppercase tracking-wider">Análise semântica</div>
            </div>
            <div className="w-px h-10 bg-white/10 hidden sm:block" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-[.72rem] text-slate-500 mt-1 uppercase tracking-wider">Automático</div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ APP CARD ═══ */}
      <section id="app" className="pb-32 px-6" aria-label="Gerar clipe viral">
        <div className="max-w-150 mx-auto">
          <div
            id="app-card"
            className="glass-card rounded-2xl p-8 relative overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,.5), 0 0 60px rgba(99,102,241,.07)" }}
          >
            {/* Tint */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: "linear-gradient(135deg,rgba(99,102,241,.06) 0%,transparent 55%)" }} aria-hidden="true" />

            {/* Card header */}
            <div className="flex items-start justify-between mb-8 relative">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Gerar Clipe Viral</h2>
                <p className="text-sm text-slate-500 mt-1">Preencha os dados e faça o upload do seu conteúdo</p>
              </div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ml-4" style={{ background: "rgba(99,102,241,.12)", border: "1px solid rgba(99,102,241,.2)" }}>
                {/* zap icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(129,140,248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
            </div>

            {/* API Key */}
            <APIKeyInput inputRef={apiKeyRef} value={apiKey} onChange={setApiKey} />

            <div className="sep mb-6" />

            {/* Upload */}
            <div className="mb-2">
              <Button
                id="upload_widget"
                onUpload={handleUpload}
                onValidate={() => {
                  if (!apiKey) {
                    showToast("Insira sua chave de API do Gemini primeiro.");
                    apiKeyRef.current?.focus();
                    return false;
                  }
                  return true;
                }}
              />
            </div>

            {/* Status panel */}
            {showStatus && (
              <div className="mt-6">
                <div className="sep mb-6" />
                <div className="glass rounded-xl p-4" style={{ borderColor: "rgba(255,255,255,.06)" }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: statusState === "success" ? "rgba(16,185,129,.14)"
                          : statusState === "error" ? "rgba(239,68,68,.14)"
                          : "rgba(99,102,241,.14)",
                        border: `1px solid ${statusState === "success" ? "rgba(16,185,129,.2)" : statusState === "error" ? "rgba(239,68,68,.2)" : "rgba(99,102,241,.2)"}`,
                      }}
                    >
                      {statusState === "success" ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(52,211,153)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                      ) : statusState === "error" ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(248,113,113)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(129,140,248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin" aria-hidden="true">
                          <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
                          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                          <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
                          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[.7rem] text-slate-500 uppercase tracking-wider mb-0.5">Status</div>
                      <div className="text-sm text-slate-200 truncate" aria-live="polite">{status}</div>
                    </div>
                  </div>
                  <div className="mt-3 h-0.75 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.06)" }}>
                    <div
                      className={`progress-bar${statusState === "error" ? " error" : ""}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Transcription panel */}
            {transcription && (
              <div className="mt-6">
                <div className="sep mb-6" />
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(129,140,248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                    </svg>
                    Transcrição
                  </div>
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText(transcription); showToast("Transcrição copiada!"); }}
                    className="text-[.75rem] text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                    aria-label="Copiar transcrição"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    Copiar
                  </button>
                </div>
                <div className="glass rounded-xl p-4 max-h-36 overflow-y-auto" style={{ borderColor: "rgba(255,255,255,.06)" }}>
                  <p className="text-sm text-slate-400 leading-relaxed">{transcription}</p>
                </div>
              </div>
            )}

            {/* Video panel */}
            {videoSrc && (
              <div className="mt-6">
                <div className="sep mb-6" />
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(129,140,248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
                    </svg>
                    Clipe Viral Gerado
                  </div>
                  <span className="flex items-center gap-1.5 text-[.72rem] text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" aria-hidden="true" />
                    Pronto
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden bg-black">
                  <video id="video" src={videoSrc} controls playsInline aria-label="Clipe viral gerado" />
                </div>
                <a
                  href={videoSrc}
                  download="viral-clip.mp4"
                  className="btn-ghost w-full mt-3 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                  aria-label="Baixar clipe viral"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Baixar clipe
                </a>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="features" className="py-28 px-6" aria-labelledby="features-title">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-20">
            <div className="section-reveal inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[.8rem] text-slate-400 mb-6 select-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(129,140,248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              Como funciona
            </div>
            <h2 id="features-title" className="section-reveal text-[clamp(2rem,5vw,3.4rem)] font-black tracking-tight text-white mb-5">
              Três etapas.<br />
              <span className="g-text">Um clipe perfeito.</span>
            </h2>
            <p className="section-reveal text-slate-400 max-w-xl mx-auto text-[1rem] leading-relaxed">
              Nossa pipeline de IA processa seu conteúdo de forma inteligente para encontrar exatamente o momento certo.
            </p>
          </div>

          {/* Bento row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

            <article className="bento p-7">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg,rgba(99,102,241,.18),rgba(99,102,241,.08))", border: "1px solid rgba(99,102,241,.2)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(129,140,248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
              </div>
              <div className="text-[.65rem] font-bold text-indigo-400 tracking-[.18em] uppercase mb-2">Etapa 01</div>
              <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Upload do conteúdo</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Envie qualquer arquivo de vídeo ou áudio. O Cloudinary processa e transcreve automaticamente em segundo plano.</p>
            </article>

            <article className="bento p-7 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(139,92,246,.18),transparent)" }} aria-hidden="true" />
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 relative" style={{ background: "linear-gradient(135deg,rgba(139,92,246,.18),rgba(139,92,246,.08))", border: "1px solid rgba(139,92,246,.22)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(167,139,250)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04"/>
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04"/>
                </svg>
              </div>
              <div className="text-[.65rem] font-bold text-violet-400 tracking-[.18em] uppercase mb-2 relative">Etapa 02</div>
              <h3 className="text-lg font-bold text-white mb-2 tracking-tight relative">Análise com Gemini</h3>
              <p className="text-sm text-slate-500 leading-relaxed relative">O Gemini 2.5 Flash lê a transcrição completa e detecta humor, emoção e momentos de pico de engajamento.</p>
            </article>

            <article className="bento p-7">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg,rgba(16,185,129,.18),rgba(16,185,129,.08))", border: "1px solid rgba(16,185,129,.2)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(52,211,153)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
                </svg>
              </div>
              <div className="text-[.65rem] font-bold text-emerald-400 tracking-[.18em] uppercase mb-2">Etapa 03</div>
              <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Clipe pronto</h3>
              <p className="text-sm text-slate-500 leading-relaxed">O segmento identificado é recortado e entregue pronto para publicação em qualquer plataforma social.</p>
            </article>
          </div>

          {/* Wide bento */}
          <article className="bento p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="flex-1">
                <div className="text-[.65rem] font-bold text-indigo-400 tracking-[.18em] uppercase mb-3">Formatos suportados</div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Compatível com qualquer formato</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Suportamos os formatos de vídeo e áudio mais populares. Basta fazer o upload e deixar a IA trabalhar.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["MP4","MOV","WEBM","MP3","WAV","M4A","AAC","OGG"].map((fmt) => (
                  <span key={fmt} className="format-tag">{fmt}</span>
                ))}
              </div>
            </div>
          </article>

        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-12 px-6" style={{ borderTop: "1px solid rgba(255,255,255,.05)" }} role="contentinfo">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md flex items-center justify-center btn-primary" style={{ boxShadow: "0 2px 10px rgba(99,102,241,.4)" }} aria-hidden="true">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white">ClipMaker</span>
          </div>
          <p className="text-[.78rem] text-slate-600">Construído com Gemini AI &amp; Cloudinary · NLW 2025</p>
          <div className="flex items-center gap-5">
            <a href="#" className="text-[.75rem] text-slate-600 hover:text-slate-400 transition-colors">Privacidade</a>
            <a href="#" className="text-[.75rem] text-slate-600 hover:text-slate-400 transition-colors">Termos</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
