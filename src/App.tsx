import { useState } from "react";
import { Header } from "./components/header";
import { Button } from "./components/Button";

const cloudName = "duglttn5l";

function App() {
  const [transcription, setTranscription] = useState("");
  const [status, setStatus] = useState("");

  function buildTranscriptionURL(public_id: string) {
    return `https://res.cloudinary.com/${cloudName}/raw/upload/${public_id}.transcript`;
  }

  async function getTranscription(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Falha ao buscar transcrição: ${response.status}`);
    }

    const rawText = await response.text();

    try {
      const parsed = JSON.parse(rawText) as Array<{ transcript?: string }>;
      const fullTranscript = parsed
        .map((item) => item.transcript ?? "")
        .join(" ")
        .trim();

      if (fullTranscript) {
        setTranscription(fullTranscript);
        setStatus("");
        return;
      }
    } catch {
      // Se nao for JSON, mostra o conteudo como texto puro.
    }

    setTranscription(rawText);
    setStatus("");
  }

  async function handleUpload(info: { public_id: string }) {
    setTranscription("");
    const url = buildTranscriptionURL(info.public_id);
    const maxAttempts = 40;
    const delay = 15000;
    const initialWait = 60000;

    setStatus("Processando áudio...");
    await new Promise((resolve) => setTimeout(resolve, initialWait));

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      setStatus(
        `Aguardando transcrição... (tentativa ${attempt}/${maxAttempts})`,
      );

      try {
        const response = await fetch(url, { cache: "no-store" });

        if (response.ok) {
          console.log(`Transcrição encontrada! - "${url}"`);
          await getTranscription(url);
          return;
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
      <Button onUpload={handleUpload} />

      {status && <p>{status}</p>}
      {transcription && <p>{transcription}</p>}
    </main>
  );
}

export default App;
