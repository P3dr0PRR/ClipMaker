import type { RefObject } from "react";

interface APIKeyInputProps {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
}

export function APIKeyInput({ inputRef, value, onChange }: APIKeyInputProps) {
  return (
    <input
      id="APIKey"
      ref={inputRef}
      type="text"
      placeholder="Coloque sua chave de API do Gemini aqui"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
