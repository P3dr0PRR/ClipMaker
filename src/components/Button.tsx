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
  onUpload: (info: { public_id: string; version: number }) => void;
}

export function Button({ onUpload }: ButtonProps) {
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
    (
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
        console.log("Upload concluido:", result.info);
        onUpload(result.info);
      }
    },
  );

  function handleClick() {
    myWidget.open();
  }

  return (
    <section>
      <button onClick={handleClick} className="cloudinary-button">
        Upload files
      </button>
    </section>
  );
}
