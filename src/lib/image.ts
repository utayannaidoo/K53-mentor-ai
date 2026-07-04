/** Client-side image prep for AI vision calls. */

export interface EncodedImage {
  /** Raw base64, no data: prefix. */
  data: string;
  mediaType: "image/jpeg";
}

/**
 * Downscale + re-encode a photo to JPEG before upload: a 12MP phone photo
 * becomes ~100-300KB, which keeps vision calls fast and cheap on mobile data.
 */
export async function fileToScaledBase64(
  file: File,
  maxDim = 1024,
  quality = 0.8,
): Promise<EncodedImage> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Could not read that image"));
      i.src = url;
    });
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(img, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    return { data: dataUrl.slice(dataUrl.indexOf(",") + 1), mediaType: "image/jpeg" };
  } finally {
    URL.revokeObjectURL(url);
  }
}
