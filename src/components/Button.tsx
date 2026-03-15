type UploadWidget = {
  open: () => void;
};

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
        info?: {
          public_id: string;
          version: number;
          resource_type?: string;
          format?: string;
        };
      } | null,
    ) => void,
  ) => UploadWidget;
};

declare const cloudinary: CloudinaryGlobal;

interface ButtonProps {
  id?: string;
  onValidate?: () => boolean;
  onUpload: (info: {
    public_id: string;
    version: number;
  }) => Promise<string | undefined>;
}

export function Button({ id, onValidate, onUpload }: ButtonProps) {
  const config = {
    cloudName: "duglttn5l",
    uploadPreset: "upload_pedro_nlw",
    resourceType: "video",
    clientAllowedFormats: [
      "mp3",
      "wav",
      "m4a",
      "aac",
      "ogg",
      "mp4",
      "mov",
      "webm",
    ],
    multiple: false,
  };

  const myWidget = cloudinary.createUploadWidget(
    config,
    async (
      error: unknown,
      result: {
        event?: string;
        info?: {
          public_id: string;
          version: number;
          resource_type?: string;
          format?: string;
        };
      } | null,
    ) => {
      if (!error && result && result.event === "success" && result.info) {
        console.log("Done here is the image info:", result.info);

        try {
          const viralMomentParam = await onUpload(result.info);
          if (viralMomentParam) {
            const viralMomentUrl = `https://res.cloudinary.com/${config.cloudName}/video/upload/${viralMomentParam}/${result.info.public_id}.mp4`;
            const videoEl = document.getElementById("video") as HTMLVideoElement | null;
            videoEl?.setAttribute("src", viralMomentUrl);
          }
        } catch (e) {
          console.log({ e });
        }
      }
    },
  );

  function handleClick() {
    if (onValidate && !onValidate()) return;
    myWidget.open();
  }

  return (
    <section>
      <button id={id} onClick={handleClick} className="cloudinary-button">
        Upload files
      </button>
    </section>
  );
}
