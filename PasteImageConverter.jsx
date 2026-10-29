import React from "react";
import { Link } from "react-router-dom";
import AdsterraBanner from "./AdsterraBanner";
import SEO from "./SEO";
import { convertImage, outputFormats } from "./imageConversion.js";
import {
  cn, formatBytes, formatDimensions,
  isSupportedImage, readableType, downloadBlob
} from "./imageUtils.js";

const formats = outputFormats.map((f) => ({ value: f.value, label: f.label }));

export default function PasteImageConverter({ darkMode }) {
  const [rating, setRating] = React.useState(0);
  const [ratingHover, setRatingHover] = React.useState(0);
  const [ratingSubmitted, setRatingSubmitted] = React.useState(false);

  const [image, setImage] = React.useState(null);
  const [format, setFormat] = React.useState("png");
  const [message, setMessage] = React.useState("Paste an image (Ctrl+V or click paste area) — then pick a format and download.");
  const [isBusy, setIsBusy] = React.useState(false);
  const imageRef = React.useRef(null);

  React.useEffect(() => {
    imageRef.current = image;
  }, [image]);

  React.useEffect(() => {
    return () => {
      if (imageRef.current) URL.revokeObjectURL(imageRef.current.url);
    };
  }, []);

  const loadFile = React.useCallback(async (file) => {
    if (!isSupportedImage(file)) {
      setMessage("Please paste a valid image file.");
      return;
    }
    setIsBusy(true);
    setMessage("Reading image...");
    try {
      const bitmap = await createImageBitmap(file);
      const nextImage = {
        file,
        name: file.name || `pasted-image.png`,
        type: readableType(file),
        size: file.size,
        width: bitmap.width,
        height: bitmap.height,
        url: URL.createObjectURL(file),
      };
      bitmap.close();
      if (imageRef.current) URL.revokeObjectURL(imageRef.current.url);
      setImage(nextImage);
      setMessage("Image ready. Choose a format and download.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load this image.");
    } finally {
      setIsBusy(false);
    }
  }, []);

  const pasteFromClipboard = React.useCallback(async () => {
    if (!navigator.clipboard?.read) {
      setMessage("Your browser blocks click-to-paste. Press Ctrl+V instead.");
      return;
    }
    setIsBusy(true);
    setMessage("Reading clipboard...");
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith("image/"));
        if (!imageType) continue;
        const blob = await item.getType(imageType);
        const file = new File([blob], `pasted-image.png`, { type: imageType });
        await loadFile(file);
        return;
      }
      setMessage("No image found in clipboard. (If you copied a file from a folder, press Ctrl+V to paste.)");
    } catch {
      setMessage("Clipboard access was blocked. Press Ctrl+V to paste.");
    } finally {
      setIsBusy(false);
    }
  }, [loadFile]);

  const downloadImage = React.useCallback(async () => {
    if (!image) { setMessage("Paste an image first."); return; }
    const options = {
      format, quality: 92, compression: "balanced",
      preserveTransparency: true, backgroundColor: "#ffffff",
      resize: { enabled: false, lockAspect: true, allowUpscale: false },
      removeMetadata: true,
    };
    setIsBusy(true);
    setMessage(`Converting to ${format.toUpperCase()}...`);
    try {
      const converted = await convertImage(image.file, options);
      downloadBlob(converted.blob, converted.fileName);
      setMessage(`Downloaded ${converted.fileName} (${formatBytes(converted.blob.size)}).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Conversion failed.");
    } finally {
      setIsBusy(false);
    }
  }, [format, image]);

  const clearImage = React.useCallback(() => {
    if (image) URL.revokeObjectURL(image.url);
    setImage(null);
    setMessage("Paste an image (Ctrl+V or click paste area) — then pick a format and download.");
  }, [image]);

  React.useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData?.items || [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            void loadFile(file);
            return;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [loadFile]);

  return (
    <>
      <SEO
        title="Paste Image Converter | Convert Clipboard Screenshots Instantly - Smart Studies"
        description="Paste any clipboard image (Ctrl+V) and convert it to PNG, JPG, WebP, or BMP instantly. No uploads, 100% private, runs entirely in your browser."
        url="https://smartstudenttools.xyz/paste-image-converter"
      />
      <div className={cn("min-h-screen px-5 pb-12 pt-7 transition-colors duration-200", darkMode ? "bg-gray-900 text-gray-100" : "bg-gradient-to-br from-slate-50 to-blue-50 text-slate-950")}>
        <section className="mx-auto max-w-5xl">
          <header className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">Image Tools</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Paste &amp; Convert Image</h1>
            <p className={cn("mt-2 text-sm", darkMode ? "text-gray-400" : "text-slate-600")}>
              Paste (Ctrl+V or click dashed box) an image from your clipboard — convert to PNG, JPG, WebP, AVIF, BMP or ICO instantly in your browser.
            </p>
          </header>

        {/* Drop zone */}
        <div
          onClick={() => { if (!image) void pasteFromClipboard(); }}
          className={cn(
            "flex min-h-[360px] w-full items-center justify-center overflow-hidden rounded-2xl border-2 backdrop-blur transition sm:min-h-[480px]",
            darkMode ? "bg-gray-800 border-gray-700 text-gray-100 shadow-xl shadow-gray-950/20" : "bg-white/80 border-slate-200 shadow-xl shadow-blue-950/5",
            !image && "cursor-pointer border-dashed hover:border-blue-400 hover:bg-blue-50/10",
            image && "border-solid"
          )}
          role="region"
          aria-label={image ? "Image preview" : "Paste image area"}
        >
          {image ? (
            <img src={image.url} alt={image.name} className="max-h-[70vh] w-full object-contain p-4" />
          ) : (
            <div className="px-6 text-center">
              <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                <PasteIcon className="h-8 w-8" />
              </div>
              <p className={cn("text-xl font-semibold", darkMode ? "text-gray-100" : "text-slate-800")}>Click to Paste Image</p>
              <p className={cn("mt-2 text-sm", darkMode ? "text-gray-400" : "text-slate-500")}>or press Ctrl+V (works for files copied from folders too)</p>
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); void pasteFromClipboard(); }}
                  disabled={isBusy}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
                >
                  Paste Image
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-7 max-w-lg">
          {image && (
            <p className={cn("mb-3 text-sm", darkMode ? "text-gray-400" : "text-slate-500")}>
              {image.type} · {formatDimensions(image.width, image.height)} · {formatBytes(image.size)}
            </p>
          )}
          <label htmlFor="paste-output-format" className={cn("block text-base font-bold", darkMode ? "text-gray-100" : "text-slate-800")}>
            Output Format
          </label>
          <select
            id="paste-output-format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className={cn("mt-2 h-14 w-full rounded-xl border px-4 text-base outline-none ring-blue-100 transition focus:ring-4",
              darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-blue-400 text-slate-950"
            )}
          >
            {formats.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={downloadImage}
              disabled={!image || isBusy}
              className="inline-flex h-13 items-center gap-3 rounded-xl bg-blue-600 px-7 py-3 text-base font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <DownloadIcon className="h-5 w-5" />
              {isBusy ? "Working..." : "Download"}
            </button>
            <button
              type="button"
              onClick={clearImage}
              disabled={!image || isBusy}
              className={cn("h-13 rounded-xl border px-7 py-3 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
                darkMode ? "bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              Clear Image
            </button>
          </div>

          <p className={cn("mt-5 min-h-6 text-sm", darkMode ? "text-gray-400" : "text-slate-500")} role="status">{message}</p>
        </div>

        {/* Structured Content Section */}
        <div className="w-full max-w-3xl mt-12 space-y-8">
          
          {/* About Clipboard Image Conversion */}
          <div className={cn("p-6 rounded-2xl border shadow-md space-y-3",
            darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-800"
          )}>
            <h3 className="text-xl font-bold">📘 About Clipboard Image Conversion</h3>
            <p className="text-sm leading-relaxed opacity-90">
              When working with screenshots, snips, or images copied directly from system file browsers, saving them to disk manually via paint or imaging software introduces extra friction. The Paste Image Converter solves this by accessing clipboard image buffers directly in your browser. This client-side converter reads raw canvas binary data and exports it immediately to popular web formats like PNG, JPG, or WebP.
            </p>
          </div>

          {/* How to Use Section */}
          <div className={cn("p-6 rounded-2xl border shadow-md space-y-3",
            darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-800"
          )}>
            <h3 className="text-xl font-bold">📖 How to Use the Clipboard Converter</h3>
            <ol className="list-decimal list-inside text-sm opacity-90 space-y-2">
              <li>Copy any image to your clipboard (using **Ctrl+C** on a file or using a snip tool like **Windows Snipping Tool**).</li>
              <li>Click inside the dashed paste block on this page or focus the window and press **Ctrl+V**.</li>
              <li>Select your target format from the **Output Format** selector.</li>
              <li>Click **Download** to save the converted image file directly to your downloads directory.</li>
            </ol>
          </div>

          {/* Technical Section */}
          <div className={cn("p-6 rounded-2xl border shadow-md space-y-3",
            darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-800"
          )}>
            <h3 className="text-xl font-bold">🧮 Aspect Ratio &amp; Resolution Formula</h3>
            <p className="text-sm leading-relaxed opacity-90">
              Pasted bitmap buffers are decoded at their native source resolution without scaling artifacts. Aspect ratio (AR) is computed as follows:
              <br />
              <code className="block my-2 bg-gray-100 dark:bg-gray-950 p-2 rounded font-mono text-center">
                Aspect Ratio = Width (pixels) / Height (pixels)
              </code>
              Maintaining the original aspect ratio prevents squishing. For example, a standard HD snip of 1920x1080 has an aspect ratio of:
              <br />
              <code className="block my-1 bg-gray-100 dark:bg-gray-950 p-1 rounded font-mono">
                1920 / 1080 = 1.777 (or 16:9)
              </code>
            </p>
          </div>

          {/* Advantages Section */}
          <div className={cn("p-6 rounded-2xl border shadow-md space-y-3",
            darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-800"
          )}>
            <h3 className="text-xl font-bold">🌟 Advantages of Pasting directly</h3>
            <ul className="list-disc list-inside text-sm opacity-90 space-y-2">
              <li><span className="font-semibold">Bypass Disk Storage:</span> Avoid polluting your desktop with intermediate screenshot files just to change formats.</li>
              <li><span className="font-semibold">Local Processing:</span> Your images are parsed locally on canvas elements. No image files are ever uploaded to remote servers.</li>
              <li><span className="font-semibold">High Compatibility:</span> Paste screenshots directly from Slack, Teams, Discord, or native explorer folders.</li>
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
                  <span>Why does pasting not work sometimes?</span>
                  <span className="accordion-icon text-xl transition-transform duration-300">+</span>
                </button>
                <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm opacity-90">
                  <p className="pt-2">Make sure that the clipboard actually contains image data (e.g. copied from a snip or file system) rather than copied text strings or links.</p>
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
                  <span>What is the best format to convert paste images to?</span>
                  <span className="accordion-icon text-xl transition-transform duration-300">+</span>
                </button>
                <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm opacity-90">
                  <p className="pt-2">PNG is recommended for screenshots containing text to keep typography clean. WebP and JPG are ideal for photograph snippets to keep the file sizes small.</p>
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
                <li><Link to="/upload-image-converter" className="hover:underline">Upload Image Converter</Link></li>
                <li><Link to="/image-to-text" className="hover:underline">Image to Text (OCR)</Link></li>
                <li><Link to="/resize-image" className="hover:underline">Image Resizer</Link></li>
                <li><Link to="/compress-image" className="hover:underline">Image Compressor</Link></li>
              </ul>
            </div>
            <div className={cn("p-6 rounded-xl border",
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            )}>
              <h4 className="font-bold text-lg mb-3">📚 Related Articles</h4>
              <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                <li><Link to="/blog/webp-vs-png" className="hover:underline">WebP vs PNG: Which Image Format Should You Use?</Link></li>
                <li><Link to="/blog/social-presets" className="hover:underline">Social Media Banner Preset Guide: Dimensions &amp; Safe Zones</Link></li>
              </ul>
            </div>
          </div>

          {/* Interactive Rating Component */}
          <div className={cn("p-6 rounded-xl border shadow-sm text-center",
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          )}>
            <h4 className="font-bold text-lg mb-2">Rate &amp; Give Feedback</h4>
            <p className={cn("text-sm mb-4", darkMode ? "text-gray-400" : "text-gray-500")}>Help us improve the paste converter dashboard</p>
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

function PasteIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M9 4h6a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 7h8M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 4v10m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
