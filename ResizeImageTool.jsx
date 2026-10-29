import React from "react";
import { Link } from "react-router-dom";
import AdsterraBanner from './AdsterraBanner';
import SEO from "./SEO";
import { convertImage } from "./imageConversion.js";
import {
  cn, formatBytes, formatDimensions,
  isSupportedImage, readableType, suggestedFormat, downloadBlob
} from "./imageUtils.js";

const outputFormats = [
  { value: "png",  label: "PNG",  description: "Lossless, transparency" },
  { value: "jpeg", label: "JPG",  description: "Smallest, no transparency" },
  { value: "webp", label: "WebP", description: "Modern, great quality" },
];

const presets = [
  { label: "Instagram Post",    width: 1080, height: 1080 },
  { label: "Instagram Story",   width: 1080, height: 1920 },
  { label: "Twitter/X Post",    width: 1200, height: 675  },
  { label: "YouTube Thumbnail", width: 1280, height: 720  },
  { label: "Facebook Cover",    width: 820,  height: 312  },
  { label: "LinkedIn Banner",   width: 1584, height: 396  },
];

export default function ResizeImageTool({ darkMode }) {
  const [rating, setRating] = React.useState(0);
  const [ratingHover, setRatingHover] = React.useState(0);
  const [ratingSubmitted, setRatingSubmitted] = React.useState(false);

  const [image, setImage] = React.useState(null);
  const [resized, setResized] = React.useState(null);
  const [targetWidth, setTargetWidth] = React.useState("");
  const [targetHeight, setTargetHeight] = React.useState("");
  const [lockAspect, setLockAspect] = React.useState(true);
  const [format, setFormat] = React.useState("png");
  const [activePreset, setActivePreset] = React.useState(null);
  const [message, setMessage] = React.useState("Upload or drop an image to resize.");
  const [isBusy, setIsBusy] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef(null);
  const imageRef = React.useRef(null);
  const resizedRef = React.useRef(null);

  React.useEffect(() => { imageRef.current = image; }, [image]);
  React.useEffect(() => { resizedRef.current = resized; }, [resized]);
  React.useEffect(() => { return () => { if (imageRef.current) URL.revokeObjectURL(imageRef.current.url); if (resizedRef.current) URL.revokeObjectURL(resizedRef.current.url); }; }, []);

  const clearResized = React.useCallback(() => { if (resizedRef.current) URL.revokeObjectURL(resizedRef.current.url); setResized(null); }, []);

  const reset = React.useCallback(() => {
    if (imageRef.current) URL.revokeObjectURL(imageRef.current.url);
    if (resizedRef.current) URL.revokeObjectURL(resizedRef.current.url);
    setImage(null); setResized(null); setTargetWidth(""); setTargetHeight("");
    setLockAspect(true); setFormat("png"); setActivePreset(null);
    setMessage("Upload or drop an image to resize.");
  }, []);

  const loadFile = React.useCallback(async (file) => {
    if (!isSupportedImage(file)) { setMessage("Please upload a valid image file."); return; }
    setIsBusy(true); setMessage("Reading image...");
    try {
      const bitmap = await createImageBitmap(file);
      const nextImage = { file, name: file.name || "image", type: readableType(file), size: file.size, width: bitmap.width, height: bitmap.height, url: URL.createObjectURL(file) };
      bitmap.close();
      if (imageRef.current) URL.revokeObjectURL(imageRef.current.url);
      clearResized();
      setImage(nextImage);
      setTargetWidth(String(bitmap.width || nextImage.width));
      setTargetHeight(String(bitmap.height || nextImage.height));
      setFormat(suggestedFormat(file));
      setActivePreset(null);
      setMessage("Image loaded. Set dimensions and resize.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not read this image.");
    } finally { setIsBusy(false); }
  }, [clearResized]);

  const handleWidthChange = React.useCallback((value) => {
    setTargetWidth(value); setActivePreset(null); clearResized();
    if (lockAspect && image) {
      const w = parseInt(value, 10);
      if (w > 0 && Number.isFinite(w)) setTargetHeight(String(Math.round(w / (image.width / image.height))));
    }
  }, [lockAspect, image, clearResized]);

  const handleHeightChange = React.useCallback((value) => {
    setTargetHeight(value); setActivePreset(null); clearResized();
    if (lockAspect && image) {
      const h = parseInt(value, 10);
      if (h > 0 && Number.isFinite(h)) setTargetWidth(String(Math.round(h * (image.width / image.height))));
    }
  }, [lockAspect, image, clearResized]);

  const applyPreset = React.useCallback((index) => {
    const p = presets[index];
    setTargetWidth(String(p.width)); setTargetHeight(String(p.height));
    setActivePreset(index); setLockAspect(false); clearResized();
  }, [clearResized]);

  const resize = React.useCallback(async () => {
    if (!image) { setMessage("Upload an image first."); return; }
    const w = parseInt(targetWidth, 10), h = parseInt(targetHeight, 10);
    if (!w || !h || w < 1 || h < 1) { setMessage("Enter valid width and height."); return; }
    if (w > 8192 || h > 8192) { setMessage("Maximum dimension is 8192 px."); return; }
    const options = { format, quality: 92, compression: "balanced", preserveTransparency: format !== "jpeg", backgroundColor: "#ffffff", resize: { enabled: true, width: w, height: h, lockAspect: false, allowUpscale: true }, removeMetadata: true };
    setIsBusy(true); setMessage(`Resizing to ${w} × ${h}...`);
    try {
      const result = await convertImage(image.file, options);
      const url = URL.createObjectURL(result.blob);
      clearResized();
      setResized({ blob: result.blob, url, fileName: `resized-${result.fileName}`, size: result.blob.size, width: result.width, height: result.height });
      setMessage("Resize complete.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Resize failed.");
    } finally { setIsBusy(false); }
  }, [clearResized, format, image, targetWidth, targetHeight]);

  const sizeChange = image && resized ? ((resized.size - image.size) / image.size) * 100 : 0;
  const sizeLabel = resized ? (sizeChange <= 0 ? `${Math.abs(sizeChange).toFixed(1)}% smaller` : `${sizeChange.toFixed(1)}% larger`) : "—";

  return (
    <>
      <SEO
        title="Image Resizer Online Free | Custom Size & Social Media Presets - Smart Studies"
        description="Resize images to custom dimensions or preset social media sizes (YouTube, Instagram, Twitter). Lock aspect ratio, crop, and convert formats — all in-browser."
        url="https://smartstudenttools.xyz/resize-image"
      />
      <div className={cn("min-h-screen px-5 pb-12 pt-7 transition-colors duration-200", darkMode ? "bg-gray-900 text-gray-100" : "bg-gradient-to-br from-slate-50 via-violet-50 to-blue-50 text-slate-950")}>
        <input ref={fileInputRef} className="sr-only" type="file" accept="image/*,.avif,.bmp,.ico"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void loadFile(f); e.target.value = ""; }} />

        <section className="mx-auto max-w-6xl">
          <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">Image Tools</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">Resize Image</h1>
              <p className={cn("mt-2 max-w-xl text-sm", darkMode ? "text-gray-400" : "text-slate-600")}>
                Upload an image, pick a preset or custom dimensions, preview, and download — no backend needed.
              </p>
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-700">
              Upload image
            </button>
          </header>

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          {/* Preview */}
          <section className="space-y-5">
            <div
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = Array.from(e.dataTransfer.files).find(isSupportedImage); if (f) void loadFile(f); else setMessage("Drop an image file."); }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={cn("grid min-h-[340px] place-items-center overflow-hidden rounded-2xl border-2 backdrop-blur transition sm:min-h-[460px]",
                darkMode ? "bg-gray-800 border-gray-700 shadow-xl" : "bg-white/80 border-dashed border-slate-200",
                isDragging ? "border-violet-500 ring-4 ring-violet-100" : "")}
              role="region" aria-label="Upload and preview image">
              {image ? (
                <div className="grid w-full gap-4 p-4 lg:grid-cols-2">
                  <PreviewCard title="Original" imageUrl={image.url} imageName={image.name} subtitle={formatDimensions(image.width, image.height)} darkMode={darkMode} />
                  <PreviewCard title="Resized" imageUrl={resized?.url} imageName={resized?.fileName ?? "Resized preview"} subtitle={resized ? formatDimensions(resized.width, resized.height) : undefined} emptyText="Set dimensions and click Resize" darkMode={darkMode} />
                </div>
              ) : (
                <div className="px-6 text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/25">
                    <UploadIcon className="h-8 w-8" />
                  </div>
                  <h2 className={cn("mt-5 text-2xl font-bold", darkMode ? "text-gray-105" : "text-slate-800")}>Upload image</h2>
                  <p className={cn("mt-2 text-sm", darkMode ? "text-gray-400" : "text-slate-500")}>Drag and drop here, or choose an image file.</p>
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="mt-6 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700">
                    Select image
                  </button>
                </div>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Original size" value={image ? formatBytes(image.size) : "—"} darkMode={darkMode} />
              <StatCard label="Resized" value={resized ? formatBytes(resized.size) : "—"} darkMode={darkMode} />
              <StatCard label="Change" value={sizeLabel} highlight={Boolean(resized)} darkMode={darkMode} />
            </div>
          </section>

          {/* Settings */}
          <aside className={cn("rounded-2xl border p-5 shadow-xl backdrop-blur",
            darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white/85 border-white shadow-violet-950/5"
          )}>
            <h2 className="text-xl font-bold">Resize Settings</h2>
            <p className={cn("mt-1 text-sm", darkMode ? "text-gray-400" : "text-slate-500")}>Pick a preset or enter custom dimensions.</p>

            <div className="mt-6 space-y-5">
              {/* Presets */}
              <div>
                <label className={cn("text-sm font-semibold", darkMode ? "text-gray-300" : "text-slate-700")}>Presets</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {presets.map((preset, index) => (
                    <button key={preset.label} type="button" onClick={() => applyPreset(index)} disabled={!image}
                      className={cn("rounded-2xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50",
                        activePreset === index 
                          ? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300" 
                          : darkMode ? "border-gray-700 bg-gray-900 text-gray-300 hover:border-violet-700" : "border-slate-200 bg-white text-slate-700 hover:border-violet-200")}>
                      <span className="block text-xs font-bold">{preset.label}</span>
                      <span className="mt-0.5 block text-[11px] text-slate-400">{preset.width} × {preset.height}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimensions */}
              <div className={cn("rounded-2xl border p-4",
                darkMode ? "bg-gray-900 border-gray-700" : "bg-slate-50 border-slate-200"
              )}>
                <label className={cn("text-sm font-semibold", darkMode ? "text-gray-300" : "text-slate-700")}>Dimensions</label>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1">
                    <label htmlFor="resize-width" className="text-xs text-slate-400">Width</label>
                    <input id="resize-width" type="number" min="1" max="8192" value={targetWidth}
                      onChange={(e) => handleWidthChange(e.target.value)} disabled={!image} placeholder="px"
                      className={cn("mt-1 h-11 w-full rounded-xl border px-3 text-sm font-semibold outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:opacity-50",
                        darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-slate-200 text-slate-900"
                      )} />
                  </div>
                  <button type="button" onClick={() => { setLockAspect((p) => !p); setActivePreset(null); clearResized(); }} disabled={!image}
                    className={cn("mt-5 grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl border transition disabled:opacity-50",
                      lockAspect 
                        ? "border-violet-300 bg-violet-50 text-violet-600 dark:border-violet-850 dark:bg-violet-950/30 dark:text-violet-400" 
                        : darkMode ? "border-gray-700 bg-gray-800 text-gray-400" : "border-slate-200 bg-white text-slate-400 hover:text-slate-600")}
                    title={lockAspect ? "Aspect ratio locked" : "Aspect ratio unlocked"}>
                    {lockAspect ? <LinkIcon className="h-4 w-4" /> : <UnlinkIcon className="h-4 w-4" />}
                  </button>
                  <div className="flex-1">
                    <label htmlFor="resize-height" className="text-xs text-slate-400">Height</label>
                    <input id="resize-height" type="number" min="1" max="8192" value={targetHeight}
                      onChange={(e) => handleHeightChange(e.target.value)} disabled={!image} placeholder="px"
                      className={cn("mt-1 h-11 w-full rounded-xl border px-3 text-sm font-semibold outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:opacity-50",
                        darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-slate-200 text-slate-900"
                      )} />
                  </div>
                </div>
                <p className="mt-2 text-center text-xs text-slate-400">{lockAspect ? "🔗 Aspect ratio maintained" : "Aspect ratio unlocked"}</p>
              </div>

              {/* Output format */}
              <div>
                <label className={cn("text-sm font-semibold", darkMode ? "text-gray-300" : "text-slate-700")}>Output type</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {outputFormats.map((item) => (
                    <button key={item.value} type="button" onClick={() => { setFormat(item.value); clearResized(); }}
                      className={cn("rounded-2xl border p-3 text-left transition",
                        format === item.value 
                          ? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300" 
                          : darkMode ? "border-gray-700 bg-gray-900 text-gray-300 hover:border-violet-200" : "border-slate-200 bg-white text-slate-700 hover:border-violet-200")}>
                      <span className="block text-sm font-bold">{item.label}</span>
                      <span className="mt-1 block text-[11px] text-slate-400">{item.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {image && (
                <div className={cn("rounded-2xl border p-4",
                  darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-slate-200"
                )}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Original</p>
                  <p className="mt-2 truncate text-sm font-semibold">{image.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{image.type} · {formatBytes(image.size)} · {formatDimensions(image.width, image.height)}</p>
                </div>
              )}

              {resized && (
                <div className={cn("rounded-2xl border p-4",
                  darkMode ? "bg-violet-950/20 border-violet-850 text-violet-200" : "bg-violet-50 border-violet-200 text-violet-800"
                )}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-violet-600">Resized</p>
                  <p className="mt-2 text-2xl font-bold">{formatDimensions(resized.width, resized.height)}</p>
                  <p className="mt-1 text-sm">{formatBytes(resized.size)} · {sizeLabel}</p>
                </div>
              )}

              <button type="button" onClick={resize} disabled={!image || isBusy}
                className="h-14 w-full rounded-2xl bg-violet-600 text-base font-bold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">
                {isBusy ? "Processing..." : "Resize"}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => resized && downloadBlob(resized.blob, resized.fileName)} disabled={!resized || isBusy}
                  className="h-12 rounded-2xl bg-slate-900 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
                  Download
                </button>
                <button type="button" onClick={reset} disabled={(!image && !resized) || isBusy}
                  className={cn("h-12 rounded-2xl text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
                    darkMode ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}>
                  Reset
                </button>
              </div>

              <p className={cn("min-h-5 text-sm", darkMode ? "text-gray-400" : "text-slate-500")} role="status">{message}</p>
            </div>
          </aside>
        </div>

        {/* Structured Content Section */}
        <div className="w-full max-w-3xl mt-12 space-y-8">
          
          {/* About Image Resizing */}
          <div className={cn("p-6 rounded-2xl border shadow-md space-y-3",
            darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-800"
          )}>
            <h3 className="text-xl font-bold">📘 About the Tool - Image Resizing &amp; Scale Factors</h3>
            <p className="text-sm leading-relaxed opacity-90">
              Resizing images modifies their physical dimensions (width and height in pixels), which subsequently affects file weight. Downscaling is useful for web optimization to lower page loads, while upscaling increases layout space. Our tool handles canvas interpolation locally, supporting both preset templates (Instagram, YouTube, LinkedIn) and custom aspect locks.
            </p>
          </div>

          {/* How to Use Section */}
          <div className={cn("p-6 rounded-2xl border shadow-md space-y-3",
            darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-800"
          )}>
            <h3 className="text-xl font-bold">📖 How to Use the Image Resizer</h3>
            <ol className="list-decimal list-inside text-sm opacity-90 space-y-2">
              <li>Drag and drop your image or click upload to load a photo.</li>
              <li>Toggle the **Aspect Ratio Lock** (link icon) if you want to scale proportionally without distortion.</li>
              <li>Enter your target width or height (the opposite dimension will auto-calculate if locked). Alternatively, select a social banner preset.</li>
              <li>Select your target format (PNG, JPG, or WebP).</li>
              <li>Click **Resize** and then **Download** to save.</li>
            </ol>
          </div>

          {/* Technical Section */}
          <div className={cn("p-6 rounded-2xl border shadow-md space-y-3",
            darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-800"
          )}>
            <h3 className="text-xl font-bold">🧮 Scale Ratio &amp; Area Formula</h3>
            <p className="text-sm leading-relaxed opacity-90">
              When resizing, the scaling factor determines the proportional decrease in overall pixel count:
              <br />
              <code className="block my-2 bg-gray-100 dark:bg-gray-950 p-2 rounded font-mono text-center">
                Scale Factor (S) = Target Width / Source Width
                <br />
                Target Height = Source Height * S
              </code>
              For example, scaling a 4000x3000 image to 1000px width yields:
              <br />
              <code className="block my-1 bg-gray-100 dark:bg-gray-950 p-1 rounded font-mono">
                S = 1000 / 4000 = 0.25 (25%)
                <br />
                Target Height = 3000 * 0.25 = 750px
              </code>
            </p>
          </div>

          {/* Advantages Section */}
          <div className={cn("p-6 rounded-2xl border shadow-md space-y-3",
            darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-800"
          )}>
            <h3 className="text-xl font-bold">🌟 Advantages of our Resizer</h3>
            <ul className="list-disc list-inside text-sm opacity-90 space-y-2">
              <li><span className="font-semibold">Local Processing:</span> Your images are drawn on system Canvas2D nodes in-memory. Zero server bandwidth or tracking.</li>
              <li><span className="font-semibold">Social Media Presets:</span> Quick template resolutions for Instagram posts, Twitter headers, and YouTube thumbnails.</li>
              <li><span className="font-semibold">Lossless Preview:</span> Visual comparisons are generated side-by-side so you can evaluate crop details before saving.</li>
            </ul>
          </div>

          {/* FAQs Section */}
          <div className={cn("p-6 rounded-2xl border shadow-md space-y-4",
            darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-800"
          )}>
            <h3 className="text-xl font-bold">❓ Frequently Asked Questions</h3>
            <div className="space-y-3">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                <button
                  className="w-full flex justify-between items-center text-left font-semibold text-base py-2 focus:outline-none"
                  onClick={(e) => {
                    const content = e.currentTarget.nextElementSibling;
                    const icon = e.currentTarget.querySelector('.accordion-icon');
                    if (content.style.maxHeight) {
                      content.style.maxHeight = null;
                      icon.style.transform = 'rotate(0deg)';
                    } else {
                      content.style.maxHeight = content.scrollHeight + 'px';
                      icon.style.transform = 'rotate(45deg)';
                    }
                  }}
                >
                  <span>Will resizing make my image blur?</span>
                  <span className="accordion-icon text-xl transition-transform duration-300">+</span>
                </button>
                <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm opacity-90">
                  <p className="pt-2">Downscaling preserves sharp details. Upscaling (enlarging beyond native pixel counts) requires pixel interpolation which can cause visual smoothing or softening.</p>
                </div>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                <button
                  className="w-full flex justify-between items-center text-left font-semibold text-base py-2 focus:outline-none"
                  onClick={(e) => {
                    const content = e.currentTarget.nextElementSibling;
                    const icon = e.currentTarget.querySelector('.accordion-icon');
                    if (content.style.maxHeight) {
                      content.style.maxHeight = null;
                      icon.style.transform = 'rotate(0deg)';
                    } else {
                      content.style.maxHeight = content.scrollHeight + 'px';
                      icon.style.transform = 'rotate(45deg)';
                    }
                  }}
                >
                  <span>Can I unlock aspect ratio constraints?</span>
                  <span className="accordion-icon text-xl transition-transform duration-300">+</span>
                </button>
                <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm opacity-90">
                  <p className="pt-2">Yes, clicking the link icon unlocks the constraint, enabling you to input custom width and height independently, which may stretch or squish the layout.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={cn("p-6 rounded-xl border",
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            )}>
              <h4 className="font-bold text-lg mb-3">🛠️ Related Image Tools</h4>
              <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                <li><Link to="/paste-image-converter" className="hover:underline">Paste Image Converter</Link></li>
                <li><Link to="/upload-image-converter" className="hover:underline">Upload Image Converter</Link></li>
                <li><Link to="/compress-image" className="hover:underline">Image Compressor</Link></li>
              </ul>
            </div>
            <div className={cn("p-6 rounded-xl border",
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            )}>
              <h4 className="font-bold text-lg mb-3">📚 Related Articles</h4>
              <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                <li><Link to="/blog/social-presets" className="hover:underline">Social Media Banner Preset Guide: Dimensions &amp; Safe Zones</Link></li>
                <li><Link to="/blog/resizing-dpi" className="hover:underline">Understanding DPI, PPI, and Pixel Resolution</Link></li>
              </ul>
            </div>
          </div>

          {/* Interactive Rating Component */}
          <div className={cn("p-6 rounded-xl border shadow-sm text-center",
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          )}>
            <h4 className="font-bold text-lg mb-2">Rate &amp; Give Feedback</h4>
            <p className={cn("text-sm mb-4", darkMode ? "text-gray-400" : "text-gray-500")}>Help us improve the image resizer dashboard</p>
            {ratingSubmitted ? (
              <p className="text-green-600 font-semibold">Thank you for your rating of {rating} stars!</p>
            ) : (
              <div className="flex justify-center items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`text-3xl focus:outline-none transition-colors ${
                      star <= (ratingHover || rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                    }`}
                    onClick={() => { setRating(star); setRatingSubmitted(true); }}
                    onMouseEnter={() => setRatingHover(star)}
                    onMouseLeave={() => setRatingHover(0)}
                  >
                    ★
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
        <AdsterraBanner />
      </section>
    </div>
    </>
  );
}

function PreviewCard({ title, imageUrl, imageName, subtitle, emptyText, darkMode }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border",
      darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-slate-50 border-slate-200"
    )}>
      <div className={cn("flex items-center justify-between border-b px-4 py-3",
        darkMode ? "border-gray-700 bg-gray-900" : "border-slate-200 bg-white"
      )}>
        <span className={cn("text-sm font-bold", darkMode ? "text-gray-100" : "text-slate-700")}>{title}</span>
        {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
      </div>
      <div className="grid aspect-[4/3] place-items-center p-3">
        {imageUrl ? (
          <img src={imageUrl} alt={imageName} className="h-full w-full object-contain" />
        ) : (
          <p className="max-w-[13rem] text-center text-sm text-slate-400">{emptyText}</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight, darkMode }) {
  return (
    <div className={cn("rounded-2xl border p-5 shadow-lg backdrop-blur",
      darkMode ? "bg-gray-800 border-gray-700 text-gray-100 shadow-gray-950/20" : "border-white bg-white/85 shadow-violet-950/5"
    )}>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={cn("mt-2 text-xl font-bold", highlight ? "text-violet-650 dark:text-violet-400" : darkMode ? "text-gray-100" : "text-slate-900")}>{value}</p>
    </div>
  );
}

function UploadIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 15v2.5A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5V15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LinkIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M9.17 14.83a4 4 0 0 1 0-5.66l2.83-2.83a4 4 0 1 1 5.66 5.66l-1.42 1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14.83 9.17a4 4 0 0 1 0 5.66l-2.83 2.83a4 4 0 1 1-5.66-5.66l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UnlinkIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M9.17 14.83a4 4 0 0 1 0-5.66l2.83-2.83a4 4 0 0 1 5.66 5.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14.83 9.17a4 4 0 0 1 0 5.66l-2.83 2.83a4 4 0 0 1-5.66-5.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
