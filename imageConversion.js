// Ported from Paste-Image-Converter/src/lib/image-conversion.ts
import { clamp, safeFileName } from "./imageUtils.js";

export const outputFormats = [
  { value: "png",  label: "PNG",  mime: "image/png",     extension: "png",  transparent: true  },
  { value: "jpeg", label: "JPG",  mime: "image/jpeg",    extension: "jpg",  transparent: false },
  { value: "webp", label: "WebP", mime: "image/webp",    extension: "webp", transparent: true  },
  { value: "avif", label: "AVIF", mime: "image/avif",    extension: "avif", transparent: true  },
  { value: "bmp",  label: "BMP",  mime: "image/bmp",     extension: "bmp",  transparent: true  },
  { value: "ico",  label: "ICO",  mime: "image/x-icon",  extension: "ico",  transparent: true  },
];

const formatMap = new Map(outputFormats.map((f) => [f.value, f]));
export function getFormat(format) { const m = formatMap.get(format); if (!m) throw new Error(`Unsupported format: ${format}`); return m; }
export function getOutputFileName(inputName, format) { return `${safeFileName(inputName)}.${getFormat(format).extension}`; }
export function formatSupportsTransparency(format) { return getFormat(format).transparent; }

export async function inspectImage(file) {
  const img = await loadCanvasSource(file);
  const info = { width: img.width, height: img.height };
  closeImageSource(img);
  return info;
}

export async function convertImage(file, options) {
  const image = await loadCanvasSource(file);
  const dims = resolveDimensions(image.width, image.height, options.resize);
  const canvas = document.createElement("canvas");
  canvas.width = dims.width; canvas.height = dims.height;
  const ctx = canvas.getContext("2d", { alpha: true, colorSpace: "srgb", willReadFrequently: options.format === "bmp" });
  if (!ctx) { closeImageSource(image); throw new Error("Cannot create canvas context."); }
  if (options.format === "jpeg" || !options.preserveTransparency) { ctx.fillStyle = options.backgroundColor; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  else { ctx.clearRect(0, 0, canvas.width, canvas.height); }
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  closeImageSource(image);
  const fileName = getOutputFileName(file.name, options.format);
  if (options.format === "bmp") return { blob: encodeBmp(ctx.getImageData(0, 0, canvas.width, canvas.height)), width: canvas.width, height: canvas.height, fileName };
  if (options.format === "ico") { const ic = prepareIconCanvas(canvas, options.backgroundColor, options.preserveTransparency); return { blob: await encodeIco(ic), width: ic.width, height: ic.height, fileName }; }
  const fmt = getFormat(options.format);
  const quality = getCanvasQuality(options);
  const blob = await canvasToBlob(canvas, fmt.mime, quality);
  return { blob, width: canvas.width, height: canvas.height, fileName };
}

function getCanvasQuality(options) {
  if (!["jpeg","webp","avif"].includes(options.format)) return undefined;
  const off = { maximum: 0.08, balanced: 0, compact: -0.18 };
  return clamp(options.quality / 100 + off[options.compression], 0.1, 1);
}

function resolveDimensions(ow, oh, resize) {
  const w = norm(resize.width), h = norm(resize.height);
  if (!resize.enabled || (!w && !h)) return { width: ow, height: oh };
  if (!resize.lockAspect) return { width: clamp(Math.round(w ?? ow), 1, 8192), height: clamp(Math.round(h ?? oh), 1, 8192) };
  let scale = 1;
  if (w && h) scale = Math.min(w / ow, h / oh); else if (w) scale = w / ow; else if (h) scale = h / oh;
  if (!resize.allowUpscale) scale = Math.min(scale, 1);
  return { width: clamp(Math.round(ow * scale), 1, 8192), height: clamp(Math.round(oh * scale), 1, 8192) };
}

function norm(v) { if (!v || !Number.isFinite(v) || v < 1) return undefined; return clamp(Math.round(v), 1, 8192); }

async function loadCanvasSource(file) {
  if ("createImageBitmap" in window) { try { return await createImageBitmap(file, { imageOrientation: "from-image", premultiplyAlpha: "premultiply" }); } catch { return loadHtmlImage(file); } }
  return loadHtmlImage(file);
}
function loadHtmlImage(file) {
  return new Promise((resolve, reject) => { const img = new Image(); const url = URL.createObjectURL(file); img.onload = () => { URL.revokeObjectURL(url); resolve(img); }; img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not decode image.")); }; img.decoding = "async"; img.src = url; });
}
function closeImageSource(img) { if ("close" in img) img.close(); }
function canvasToBlob(canvas, type, quality) { return new Promise((resolve, reject) => { canvas.toBlob((b) => { if (b) { resolve(b); return; } reject(new Error(`${type} not supported.`)); }, type, quality); }); }
function prepareIconCanvas(src, bg, transparent) {
  const size = clamp(Math.max(src.width, src.height), 16, 256);
  const c = document.createElement("canvas"); c.width = size; c.height = size;
  const ctx = c.getContext("2d", { alpha: true }); if (!ctx) throw new Error("Cannot create icon canvas.");
  if (!transparent) { ctx.fillStyle = bg; ctx.fillRect(0, 0, size, size); }
  const scale = Math.min(size / src.width, size / src.height);
  const w = Math.round(src.width * scale), h = Math.round(src.height * scale);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, Math.round((size - w) / 2), Math.round((size - h) / 2), w, h);
  return c;
}
async function encodeIco(canvas) {
  const pngBlob = await canvasToBlob(canvas, "image/png");
  const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
  const header = new ArrayBuffer(22); const view = new DataView(header);
  const w = canvas.width >= 256 ? 0 : canvas.width, h = canvas.height >= 256 ? 0 : canvas.height;
  view.setUint16(0,0,true); view.setUint16(2,1,true); view.setUint16(4,1,true);
  view.setUint8(6,w); view.setUint8(7,h); view.setUint8(8,0); view.setUint8(9,0);
  view.setUint16(10,1,true); view.setUint16(12,32,true);
  view.setUint32(14,pngBytes.byteLength,true); view.setUint32(18,22,true);
  return new Blob([header, pngBytes], { type: "image/x-icon" });
}
function encodeBmp(imageData) {
  const { width, height, data } = imageData;
  const hs = 54, bpp = 4, pas = width * height * bpp;
  const buf = new ArrayBuffer(hs + pas); const view = new DataView(buf);
  view.setUint8(0,0x42); view.setUint8(1,0x4d); view.setUint32(2,buf.byteLength,true); view.setUint32(10,hs,true);
  view.setUint32(14,40,true); view.setInt32(18,width,true); view.setInt32(22,-height,true);
  view.setUint16(26,1,true); view.setUint16(28,32,true); view.setUint32(30,0,true); view.setUint32(34,pas,true);
  view.setInt32(38,2835,true); view.setInt32(42,2835,true); view.setUint32(46,0,true); view.setUint32(50,0,true);
  for (let i=0; i<width*height; i++) { const s=i*4, t=hs+i*bpp; view.setUint8(t,data[s+2]); view.setUint8(t+1,data[s+1]); view.setUint8(t+2,data[s]); view.setUint8(t+3,data[s+3]); }
  return new Blob([buf], { type: "image/bmp" });
}
