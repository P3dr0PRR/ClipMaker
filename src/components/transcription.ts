const cloudName = "duglttn5l";

export function buildTranscriptionURL(public_id: string): string {
  return `https://res.cloudinary.com/${cloudName}/raw/upload/${public_id}.transcript`;
}

export async function fetchTranscription(url: string): Promise<string> {
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

    if (fullTranscript) return fullTranscript;
  } catch {
    // Se nao for JSON, retorna o conteúdo como texto puro.
  }

  return rawText;
}
