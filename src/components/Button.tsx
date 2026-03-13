declare const cloudinary: any

export function Button() {
const config = {
cloudName: "duglttn5l",
uploadPreset: "upload_pedro_nlw",
};

const myWidget = cloudinary.createUploadWidget(
config,
(error: unknown, result: { event?: string; info?: unknown } | null) => {
if (!error && result && result.event === "success") {
console.log("Done! Here is the image info: ", result.info);
}
}
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

