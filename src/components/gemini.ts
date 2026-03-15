export async function getViralMoment(
  transcriptionText: string,
  apiKey: string,
): Promise<string> {
  const model = "gemini-2.5-flash";
  const endpointGemini = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const prompt = `Role: You are a professional video editor specializing in viral content.
    Task: ANalize the transcription below and identify the most engaging, funny, or surprising segment.
    Constraints:
    1.Duration: Minimun 30 seconds, Maximun 60 seconds.
    2. Format: Return ONLY the start and end string for Cloudnary. Format: so<start_seconds>,eo_<end_seconds>
    3. Examples: "so_10,eo_20" or "so_12.5,eo_45.2"
    4.CRITICAL: Do not use markdown, do not use quotes, do not explain. Return ONLY the raw string.

    Transcription:
      ${transcriptionText}`;

  const headers = {
    "x-goog-api-key": apiKey,
    "Content-Type": "application/json",
  };
  const contents = [{ parts: [{ text: prompt }] }];
  const maxRetries = 3;
  const retryDelay = 2000;
  let response: Response | null = null;

  console.log("Chamando Gemini...");

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      response = await fetch(endpointGemini, {
        method: "POST",
        headers,
        body: JSON.stringify({ contents }),
      });
      break;
    } catch (error) {
      const isConnectionError = error instanceof TypeError;
      if (!isConnectionError || attempt === maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  if (!response) {
    throw new Error("Falha de conexão com o Gemini.");
  }

  const data = await response.json();
  const rawText = data.candidates[0].content.parts[0].text.trim();
  return rawText.replace(/```/g, "").replace(/json/g, "").trim();
}
