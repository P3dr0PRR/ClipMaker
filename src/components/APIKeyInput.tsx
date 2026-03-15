import { useState } from "react";
import type { RefObject } from "react";

interface APIKeyInputProps {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
}

export function APIKeyInput({ inputRef, value, onChange }: APIKeyInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="mb-6">
      <label htmlFor="APIKey" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2.5">
        {/* key icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(129,140,248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>
        </svg>
        Chave da API Gemini
      </label>

      <div className="relative">
        <input
          id="APIKey"
          ref={inputRef}
          type={visible ? "text" : "password"}
          placeholder="AIzaSy…"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="api-input w-full rounded-xl px-4 py-3.5 text-sm pr-12"
          aria-label="Chave de API do Gemini"
        />
        <button
          type="button"
          aria-label="Alternar visibilidade da chave"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          {visible ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>

      <p className="flex items-center gap-1.5 text-[.72rem] text-slate-600 mt-2">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        Chave processada localmente — nunca armazenada
      </p>
    </div>
  );
}
