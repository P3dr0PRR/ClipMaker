import { useRef, useState } from "react";
import { Header } from "./components/header";
import { Button } from "./components/Button";
import { APIKeyInput } from "./components/APIKeyInput";
import { buildTranscriptionURL, fetchTranscription } from "./components/transcription";
import { getViralMoment } from "./components/gemini";

export function App() {
  const [transcription, setTranscription] = useState("");
  const [status, setStatus] = useState("");
  const [apiKey, setApiKey] = useState("");
  const apiKeyRef = useRef<HTMLInputElement>(null);

  async function handleUpload(info: { public_id: string }): Promise<string | undefined> {
    setTranscription("");
    const url = buildTranscriptionURL(info.public_id);
    const maxAttempts = 40;
    const delay = 15000;
    const initialWait = 60000;

    setStatus("Processando áudio...");
    await new Promise((resolve) => setTimeout(resolve, initialWait));

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      setStatus(`Aguardando transcrição... (tentativa ${attempt}/${maxAttempts})`);

      try {
        const response = await fetch(url, { cache: "no-store" });

        if (response.ok) {
          console.log(`Transcrição encontrada! - "${url}"`);
          const transcriptionText = await fetchTranscription(url);
          setTranscription(transcriptionText);
          setStatus("Analisando momento viral...");

          const viralMomentParam = await getViralMoment(transcriptionText, apiKey);
          setStatus(`Momento viral: ${viralMomentParam}`);
          return viralMomentParam;
        }
      } catch (error) {
        console.error("Erro ao testar URL:", url, error);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    setStatus("Transcrição não encontrada. Tente colar a URL manualmente.");
  }

  return (
    <main>
      <Header />
      <APIKeyInput
        inputRef={apiKeyRef}
        value={apiKey}
        onChange={setApiKey}
      />
      <Button
        id="upload_widget"
        onUpload={handleUpload}
        onValidate={() => {
          if (!apiKey) {
            alert("Por favor, insira sua chave de API do Gemini.");
            apiKeyRef.current?.focus();
            return false;
          }
          return true;
        }}
      />
      <p id="status"></p>
      <video id="video" controls></video>

      {status && <p>{status}</p>}
      {transcription && <p>{transcription}</p>}
    </main>
  );
}
