// Ported from Paste-Image-Converter/src/lib/utils.ts

export function cn(...classes) { return classes.filter(Boolean).join(" "); }
export function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
export function formatDimensions(w, h) { return `${w} × ${h}`; }
export function safeFileName(name) {
  if (!name) return "image";
  const base = name.replace(/\.[^.]+$/, "");
  return base.replace(/[^a-zA-Z0-9_\-]/g, "_").replace(/_{2,}/g, "_").replace(/^_+|_+$/g, "") || "image";
}
export function isSupportedImage(file) { return file && file.type.startsWith("image/"); }
export function isImageFile(file) { return file && file.type.startsWith("image/"); }
export function readableType(file) { return file.type.replace("image/", "").toUpperCase(); }
export function suggestedFormat(file) {
  if (!file) return "webp";
  const t = file.type;
  if (t === "image/jpeg") return "jpeg";
  if (t === "image/gif")  return "webp";
  return "webp";
}
export function extensionFromMime(mime) {
  const map = { "image/png":"png","image/jpeg":"jpg","image/webp":"webp","image/avif":"avif","image/bmp":"bmp","image/x-icon":"ico","image/gif":"gif" };
  return map[mime] || "png";
}
export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = fileName; a.click();
  URL.revokeObjectURL(url);
}
