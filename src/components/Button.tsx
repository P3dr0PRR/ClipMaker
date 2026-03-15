import { useState } from "react";

type UploadWidget = { open: () => void };
type CloudinaryGlobal = {
  createUploadWidget: (
    config: {
      cloudName: string;
      uploadPreset: string;
      resourceType: string;
      clientAllowedFormats: string[];
      multiple: boolean;
    },
    callback: (
      error: unknown,
      result: {
        event?: string;
        info?: { public_id: string; version: number; resource_type?: string; format?: string };
      } | null,
    ) => void,
  ) => UploadWidget;
};

declare const cloudinary: CloudinaryGlobal;

interface ButtonProps {
  id?: string;
  onValidate?: () => boolean;
  onUpload: (info: { public_id: string; version: number }) => Promise<string | undefined>;
}

export function Button({ id, onValidate, onUpload }: ButtonProps) {
  const [loading, setLoading] = useState(false);

  const config = {
    cloudName: "duglttn5l",
    uploadPreset: "upload_pedro_nlw",
    resourceType: "video",
    clientAllowedFormats: ["mp3", "wav", "m4a", "aac", "ogg", "mp4", "mov", "webm"],
    multiple: false,
  };

  const myWidget = cloudinary.createUploadWidget(
    config,
    async (error, result) => {
      if (!error && result && result.event === "success" && result.info) {
        setLoading(true);
        try {
          const viralMomentParam = await onUpload(result.info);
          if (viralMomentParam) {
            const viralMomentUrl = `https://res.cloudinary.com/${config.cloudName}/video/upload/${viralMomentParam}/${result.info.public_id}.mp4`;
            const videoEl = document.getElementById("video") as HTMLVideoElement | null;
            videoEl?.setAttribute("src", viralMomentUrl);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    },
  );

  function handleClick() {
    if (onValidate && !onValidate()) return;
    myWidget.open();
  }

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(129,140,248)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
        </svg>
        Vídeo ou Áudio
      </label>

      <button
        id={id}
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="btn-primary w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2.5"
        aria-label="Selecionar arquivo para upload"
      >
        {loading ? (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin" aria-hidden="true">
              <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
              <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
            </svg>
            Processando…
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Selecionar arquivo
          </>
        )}
      </button>

      <p className="text-center text-[.7rem] text-slate-600 mt-2">
        MP3 · WAV · M4A · AAC · OGG · MP4 · MOV · WEBM
      </p>
    </div>
  );
}
