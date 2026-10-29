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
  { value: "webp", label: "WebP", description: "Best for web" },
  { value: "jpeg", label: "JPG",  description: "Widely compatible" },
  { value: "png",  label: "PNG",  description: "Lossless" },
];

export default function CompressImageTool({ darkMode }) {
  const [rating, setRating] = React.useState(0);
  const [ratingHover, setRatingHover] = React.useState(0);
  const [ratingSubmitted, setRatingSubmitted] = React.useState(false);

  const [image, setImage] = React.useState(null);
  const [compressed, setCompressed] = React.useState(null);
  const [quality, setQuality] = React.useState(72);
  const [format, setFormat] = React.useState("webp");
  const [message, setMessage] = React.useState("Upload or drop a JPG, PNG, or WebP image.");
  const [isBusy, setIsBusy] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef(null);
  const imageRef = React.useRef(null);
  const compressedRef = React.useRef(null);

  React.useEffect(() => { imageRef.current = image; }, [image]);
  React.useEffect(() => { compressedRef.current = compressed; }, [compressed]);
  React.useEffect(() => { return () => { if (imageRef.current) URL.revokeObjectURL(imageRef.current.url); if (compressedRef.current) URL.revokeObjectURL(compressedRef.current.url); }; }, []);

  const clearCompressed = React.useCallback(() => { if (compressedRef.current) URL.revokeObjectURL(compressedRef.current.url); setCompressed(null); }, []);

  const reset = React.useCallback(() => {
    if (imageRef.current) URL.revokeObjectURL(imageRef.current.url);
    if (compressedRef.current) URL.revokeObjectURL(compressedRef.current.url);
    setImage(null); setCompressed(null); setQuality(72); setFormat("webp");
    setMessage("Upload or drop a JPG, PNG, or WebP image.");
  }, []);

  const loadFile = React.useCallback(async (file) => {
    if (!isSupportedImage(file)) { setMessage("Please upload a JPG, PNG, or WebP image."); return; }
    setIsBusy(true); setMessage("Reading image...");
    try {
      const bitmap = await createImageBitmap(file);
      const nextImage = { file, name: file.name || "image", type: readableType(file), size: file.size, width: bitmap.width, height: bitmap.height, url: URL.createObjectURL(file) };
      bitmap.close();
      if (imageRef.current) URL.revokeObjectURL(imageRef.current.url);
      clearCompressed();
      setImage(nextImage);
      setFormat(suggestedFormat(file));
      setMessage("Image loaded. Adjust quality and compress.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not read this image.");
    } finally { setIsBusy(false); }
  }, [clearCompressed]);

  const compress = React.useCallback(async () => {
    if (!image) { setMessage("Upload an image first."); return; }
    const options = { format, quality, compression: "balanced", preserveTransparency: format !== "jpeg", backgroundColor: "#ffffff", resize: { enabled: false, lockAspect: true, allowUpscale: false }, removeMetadata: true };
    setIsBusy(true); setMessage(`Compressing to ${format.toUpperCase()} at ${quality}%...`);
    try {
      const result = await convertImage(image.file, options);
      const url = URL.createObjectURL(result.blob);
      clearCompressed();
      setCompressed({ blob: result.blob, url, fileName: `compressed-${result.fileName}`, size: result.blob.size, width: result.width, height: result.height });
      setMessage("Compression complete.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Compression failed.");
    } finally { setIsBusy(false); }
  }, [clearCompressed, format, image, quality]);

  const savedPercent = image && compressed ? ((image.size - compressed.size) / image.size) * 100 : 0;
  const savedLabel = compressed ? (savedPercent >= 0 ? `${savedPercent.toFixed(1)}% saved` : `${Math.abs(savedPercent).toFixed(1)}% larger`) : "—";

  return (
    <>
      <SEO
        title="Image Compressor Online | Reduce JPG, PNG, WebP Size Free - Smart Studies"
        description="Compress JPG, PNG, and WebP images online. Reduce file size instantly in your browser with no uploads, no servers, and no quality loss."
        url="https://smartstudenttools.xyz/compress-image"
      />
      <div className={cn("min-h-screen px-5 pb-12 pt-7 transition-colors duration-200", darkMode ? "bg-gray-900 text-gray-100" : "bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 text-slate-950")}>
        <input ref={fileInputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void loadFile(f); e.target.value = ""; }} />

        <section className="mx-auto max-w-6xl">
          <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">Image Tools</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">Compress Image</h1>
              <p className={cn("mt-2 max-w-xl text-sm", darkMode ? "text-gray-400" : "text-slate-650")}>
                Upload a JPG, PNG, or WebP image, tune the quality, preview, and download — without a backend.
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
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = Array.from(e.dataTransfer.files).find(isSupportedImage); if (f) void loadFile(f); else setMessage("Drop a JPG, PNG, or WebP image."); }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={cn("grid min-h-[340px] place-items-center overflow-hidden rounded-2xl border-2 backdrop-blur transition sm:min-h-[460px]",
                darkMode ? "bg-gray-800 border-gray-700 shadow-xl" : "bg-white/80 border-dashed border-slate-200",
                image && "border-solid")}
              role="region" aria-label="Upload and preview image">
              {image ? (
                <div className="grid w-full gap-4 p-4 lg:grid-cols-2">
                  <PreviewCard title="Original Preview" imageUrl={image.url} imageName={image.name} darkMode={darkMode} />
                  <PreviewCard title="Compressed Preview" imageUrl={compressed?.url} imageName={compressed?.fileName ?? "Compressed preview"} emptyText="Compress to see the smaller preview" darkMode={darkMode} />
                </div>
              ) : (
                <div className="px-6 text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
                    <UploadIcon className="h-8 w-8" />
                  </div>
                  <h2 className={cn("mt-5 text-2xl font-bold", darkMode ? "text-gray-100" : "text-slate-800")}>Upload image</h2>
                  <p className={cn("mt-2 text-sm", darkMode ? "text-gray-400" : "text-slate-500")}>Drag and drop here, or choose a JPG, PNG, or WebP file.</p>
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                    Select image
                  </button>
                </div>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Original size" value={image ? formatBytes(image.size) : "—"} darkMode={darkMode} />
              <StatCard label="Dimensions" value={image ? formatDimensions(image.width, image.height) : "—"} darkMode={darkMode} />
              <StatCard label="Saved" value={savedLabel} highlight={Boolean(compressed)} darkMode={darkMode} />
            </div>
          </section>

          {/* Settings */}
          <aside className={cn("rounded-2xl border p-5 shadow-xl backdrop-blur",
            darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "border-white bg-white/85 shadow-emerald-950/5"
          )}>
            <h2 className="text-xl font-bold">Compression Settings</h2>
            <p className={cn("mt-1 text-sm", darkMode ? "text-gray-400" : "text-slate-500")}>Quality affects JPG and WebP most. PNG is re-encoded losslessly.</p>

            <div className="mt-6 space-y-5">
              {/* Output type */}
              <div>
                <label className={cn("text-sm font-semibold", darkMode ? "text-gray-300" : "text-slate-700")}>Output type</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {outputFormats.map((item) => (
                    <button key={item.value} type="button" onClick={() => { setFormat(item.value); clearCompressed(); }}
                      className={cn("rounded-2xl border p-3 text-left transition",
                        format === item.value 
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300" 
                          : darkMode ? "border-gray-700 bg-gray-900 text-gray-300 hover:border-emerald-700" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200")}>
                      <span className="block text-sm font-bold">{item.label}</span>
                      <span className="mt-1 block text-[11px] text-slate-400">{item.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality slider */}
              <div className={cn("rounded-2xl border p-4",
                darkMode ? "bg-gray-900 border-gray-700" : "bg-slate-50 border-slate-200"
              )}>
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="compress-quality" className={cn("text-sm font-semibold", darkMode ? "text-gray-300" : "text-slate-700")}>Quality</label>
                  <span className={cn("rounded-full px-3 py-1 text-sm font-bold shadow-sm",
                    darkMode ? "bg-gray-800 text-emerald-400" : "bg-white text-emerald-600"
                  )}>{quality}%</span>
                </div>
                <input id="compress-quality" type="range" min="10" max="100" value={quality}
                  onChange={(e) => { setQuality(Number(e.target.value)); clearCompressed(); }}
                  className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 dark:bg-gray-700 accent-emerald-600" />
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>Smaller</span><span>Sharper</span>
                </div>
              </div>

              {image && (
                <div className={cn("rounded-2xl border p-4",
                  darkMode ? "bg-gray-900 border-gray-705" : "bg-white border-slate-200"
                )}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Original</p>
                  <p className="mt-2 truncate text-sm font-semibold">{image.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{image.type} · {formatBytes(image.size)} · {formatDimensions(image.width, image.height)}</p>
                </div>
              )}

              {compressed && (
                <div className={cn("rounded-2xl border p-4",
                  darkMode ? "bg-emerald-950/20 border-emerald-850 text-emerald-200" : "bg-emerald-50 border-emerald-200 text-emerald-850"
                )}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Compressed</p>
                  <p className="mt-2 text-2xl font-bold">{formatBytes(compressed.size)}</p>
                  <p className="mt-1 text-sm">{savedLabel}</p>
                </div>
              )}

              <button type="button" onClick={compress} disabled={!image || isBusy}
                className="h-14 w-full rounded-2xl bg-emerald-600 text-base font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
                {isBusy ? "Processing..." : "Compress"}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => compressed && downloadBlob(compressed.blob, compressed.fileName)} disabled={!compressed || isBusy}
                  className="h-12 rounded-2xl bg-slate-900 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
                  Download
                </button>
                <button type="button" onClick={reset} disabled={(!image && !compressed) || isBusy}
                  className={cn("h-12 rounded-2xl text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
                    darkMode ? "bg-gray-700 text-gray-250 hover:bg-gray-600" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
          
          {/* About Image Compression */}
          <div className={cn("p-6 rounded-2xl border shadow-md space-y-3",
            darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-800"
          )}>
            <h3 className="text-xl font-bold">📘 About the Tool - Image Compression</h3>
            <p className="text-sm leading-relaxed opacity-90">
              Compression reduces the amount of storage space (bytes) required to store an image without reducing the dimension pixels. Lossless compression algorithms (like PNG) reduce file size without any quality degradation by indexing common color blocks. Lossy compression formats (like JPG and WebP) selectively discard high-frequency detail data that the human eye is less sensitive to, providing dramatic file weight savings.
            </p>
          </div>

          {/* How to Use Section */}
          <div className={cn("p-6 rounded-2xl border shadow-md space-y-3",
            darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-800"
          )}>
            <h3 className="text-xl font-bold">📖 How to Use the Image Compressor</h3>
            <ol className="list-decimal list-inside text-sm opacity-90 space-y-2">
              <li>Upload a JPG, PNG, or WebP file.</li>
              <li>Tune the **Quality slider** to find the optimal balance between visual quality and byte savings.</li>
              <li>Select your target format. WebP is recommended for the best compression results on the web.</li>
              <li>Click **Compress** to generate the compressed copy in-browser.</li>
              <li>Download the resulting file.</li>
            </ol>
          </div>

          {/* Technical Section */}
          <div className={cn("p-6 rounded-2xl border shadow-md space-y-3",
            darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-800"
          )}>
            <h3 className="text-xl font-bold">🧮 Data Reduction Formula &amp; Equations</h3>
            <p className="text-sm leading-relaxed opacity-90">
              Size compression yields can be quantified relative to original sizes:
              <br />
              <code className="block my-2 bg-gray-100 dark:bg-gray-950 p-2 rounded font-mono text-center">
                Compression Ratio = Original Size / Compressed Size
                <br />
                Savings % = (1 - (Compressed Size / Original Size)) * 100
              </code>
              For example, a photo compressed from 5MB to 1MB yields:
              <br />
              <code className="block my-1 bg-gray-100 dark:bg-gray-950 p-1 rounded font-mono">
                Ratio = 5 / 1 = 5:1 compression
                <br />
                Savings = (1 - 0.2) * 100 = 80% reduction
              </code>
            </p>
          </div>

          {/* Advantages Section */}
          <div className={cn("p-6 rounded-2xl border shadow-md space-y-3",
            darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-800"
          )}>
            <h3 className="text-xl font-bold">🌟 Advantages of Local Compression</h3>
            <ul className="list-disc list-inside text-sm opacity-90 space-y-2">
              <li><span className="font-semibold">Bandwidth Savings:</span> Reduce page weight for faster web uploads and emails.</li>
              <li><span className="font-semibold">Local &amp; Secure:</span> Processing happens entirely inside browser JavaScript routines. Your private photos are never uploaded online.</li>
              <li><span className="font-semibold">Side-by-Side Previews:</span> Instantly inspect compression artifacts in real-time before downloading.</li>
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
                  <span>Does quality loss happen during PNG compression?</span>
                  <span className="accordion-icon text-xl transition-transform duration-300">+</span>
                </button>
                <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm opacity-90">
                  <p className="pt-2">No. PNG uses DEFLATE compression which is lossless. Re-encoding a PNG maintains 100% of the pixel information, though file size reduction will be modest compared to JPG/WebP.</p>
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
                  <span>What quality level is recommended?</span>
                  <span className="accordion-icon text-xl transition-transform duration-300">+</span>
                </button>
                <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm opacity-90">
                  <p className="pt-2">A quality setting of 70% to 80% is the sweet spot. It usually reduces file sizes by 70-80% with minimal human-detectable loss of quality.</p>
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
                <li><Link to="/resize-image" className="hover:underline">Image Resizer</Link></li>
              </ul>
            </div>
            <div className={cn("p-6 rounded-xl border",
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            )}>
              <h4 className="font-bold text-lg mb-3">📚 Related Articles</h4>
              <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                <li><Link to="/blog/image-conversions-performance" className="hover:underline">How Optimizing Images Speeds Up Website Loading</Link></li>
                <li><Link to="/blog/webp-vs-png" className="hover:underline">WebP vs PNG: Which Image Format Should You Use?</Link></li>
              </ul>
            </div>
          </div>

          {/* Interactive Rating Component */}
          <div className={cn("p-6 rounded-xl border shadow-sm text-center",
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          )}>
            <h4 className="font-bold text-lg mb-2">Rate &amp; Give Feedback</h4>
            <p className={cn("text-sm mb-4", darkMode ? "text-gray-400" : "text-gray-500")}>Help us improve the image compressor dashboard</p>
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

function PreviewCard({ title, imageUrl, imageName, emptyText, darkMode }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border",
      darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-slate-50 border-slate-200"
    )}>
      <div className={cn("border-b px-4 py-3 text-sm font-bold",
        darkMode ? "border-gray-700 bg-gray-900" : "border-slate-200 bg-white"
      )}>{title}</div>
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
      darkMode ? "bg-gray-800 border-gray-700 text-gray-100 shadow-emerald-950/20" : "border-white bg-white/85 shadow-emerald-950/5"
    )}>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={cn("mt-2 text-xl font-bold", highlight ? "text-emerald-600 dark:text-emerald-400" : darkMode ? "text-gray-100" : "text-slate-900")}>{value}</p>
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
