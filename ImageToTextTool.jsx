import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdsterraBanner from './AdsterraBanner';
import RecommendedTools from './RecommendedTools';
import SEO from './SEO';

// Supported OCR languages
const LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'spa', name: 'Spanish' },
  { code: 'fra', name: 'French' },
  { code: 'deu', name: 'German' },
  { code: 'hin', name: 'Hindi' },
  { code: 'ara', name: 'Arabic' },
  { code: 'chi_sim', name: 'Chinese (Simplified)' },
  { code: 'jpn', name: 'Japanese' },
];

const ImageToTextTool = ({ darkMode }) => {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [lang, setLang] = useState('eng');
  const [extractedText, setExtractedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // Feedback rating state
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [comment, setComment] = useState('');

  const fileInputRef = useRef(null);

  // Dynamic Tesseract.js script loader
  const loadTesseract = () => {
    return new Promise((resolve, reject) => {
      if (window.Tesseract) {
        resolve(window.Tesseract);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.3/dist/tesseract.min.js';
      script.onload = () => {
        resolve(window.Tesseract);
      };
      script.onerror = () => reject(new Error('Failed to load OCR engine library.'));
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    loadTesseract().catch(err => {
      console.error(err);
      setStatusMessage('Warning: Could not pre-load OCR engine.');
    });
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const acceptFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }
    setError('');
    setImage(file);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(URL.createObjectURL(file));
    setExtractedText('');
    setProgress(0);
    setStatusMessage(`Loaded: ${file.name} (${formatBytes(file.size)})`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      acceptFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      acceptFile(file);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData || e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          acceptFile(file);
          break;
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [imageUrl]);

  const handleExtractText = async () => {
    if (!image) {
      setError('Please choose or drag/paste an image first.');
      return;
    }
    setError('');
    setIsProcessing(true);
    setProgress(0);
    setStatusMessage('Initializing Tesseract OCR engine...');

    try {
      const Tesseract = window.Tesseract || await loadTesseract();
      
      setStatusMessage('Loading language training data...');
      
      const { data: { text } } = await Tesseract.recognize(
        image,
        lang,
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
              setStatusMessage(`Extracting text: ${Math.round(m.progress * 100)}%`);
            } else {
              setStatusMessage(`${m.status.charAt(0).toUpperCase() + m.status.slice(1)}...`);
            }
          }
        }
      );

      setExtractedText(text || 'No text could be found in the image.');
      setStatusMessage('✅ Text extraction complete!');
      setProgress(100);
    } catch (err) {
      console.error(err);
      setError('An error occurred during text extraction. Please try another image.');
      setStatusMessage('');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    alert('Copied to clipboard!');
  };

  const downloadTxt = () => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${image?.name.split('.')[0] || 'extracted-text'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startOver = () => {
    setImage(null);
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl('');
    setExtractedText('');
    setProgress(0);
    setStatusMessage('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const inputCls = `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition ${
    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
  }`;

  const cardCls = `rounded-2xl border p-6 transition-all ${
    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  }`;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <SEO
        title="Image to Text Converter Online Free | OCR - SmartStudentTools"
        description="Extract text from images, photos, and scanned documents online for free. Clean, fast, and 100% browser-based OCR with no uploads required."
        url="https://smartstudenttools.xyz/image-to-text"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Image to Text Converter (OCR)',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            description: 'Extract text from screenshots, scanned notes, or images instantly in your browser. 100% client-side.',
          },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 py-10">
        
        {/* ── H1 / Hero ─────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 flex items-center justify-center gap-3">
            <span className="text-4xl">🔍</span> Image to Text Converter (OCR)
          </h1>
          <p className={`text-sm md:text-base max-w-xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Extract text from screenshots, scanned notes, or images instantly in your browser.<br />
            100% private processing — your images are never uploaded to any server.
          </p>
        </div>

        {/* ── Feature Pills ──────────────────────────────────────── */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            ['🔍', 'Accurate OCR Extraction'],
            ['📋', 'Copy to Clipboard'],
            ['🔒', '100% Client-side'],
            ['⚡', 'Lightning Fast'],
            ['🆓', 'Free Forever'],
            ['📱', 'Mobile Friendly'],
          ].map(([icon, label]) => (
            <span key={label} className={`text-xs px-3 py-1.5 rounded-full font-medium border ${
              darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'
            }`}>{icon} {label}</span>
          ))}
        </div>

        {/* ── Upload / Drag / Paste Zone ──────────────────────────── */}
        <div className={`${cardCls} mb-6`}>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10'
                : darkMode
                  ? 'border-gray-600 hover:border-purple-500'
                  : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="text-5xl mb-3">🖼️</div>
            {image ? (
              <div>
                <p className="font-semibold text-base mb-1">{image.name}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatBytes(image.size)}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); startOver(); }}
                  className="mt-3 text-xs text-red-500 hover:text-red-700 underline"
                >
                  Remove &amp; choose another
                </button>
              </div>
            ) : (
              <>
                <p className={`font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Drag &amp; Drop Image Here
                </p>
                <p className={`text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>or</p>
                <p className={`text-xs mb-4 font-medium ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                  Press Ctrl+V to paste an image directly
                </p>
                <span className="inline-block px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition">
                  Choose Image
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── Image Configuration / Processing ────────────────────── */}
        {image && (
          <div className={`${cardCls} mb-6`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Image Preview */}
              <div className="flex justify-center max-h-64 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 p-2">
                <img src={imageUrl} alt="Upload preview" className="max-h-60 object-contain rounded" />
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Select Text Language
                  </label>
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className={inputCls}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleExtractText}
                  disabled={isProcessing}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition text-base shadow-md"
                >
                  {isProcessing ? 'Extracting Text...' : '🔍 Extract Text'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <span>❌</span> <span>{error}</span>
              </div>
            )}

            {/* Progress Area */}
            {isProcessing && (
              <div className="mt-6 border-t pt-4 dark:border-gray-700">
                <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-2 rounded-full bg-purple-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className={`text-xs mt-2 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {statusMessage || 'Initializing OCR engine...'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Extracted Text Results ──────────────────────────────── */}
        {extractedText && (
          <div className={`${cardCls} mb-6`}>
            <h3 className="text-lg font-bold mb-3 flex items-center justify-between">
              <span>📝 Extracted Text</span>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 bg-gray-150 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                >
                  📋 Copy
                </button>
                <button
                  onClick={downloadTxt}
                  className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/40 dark:hover:bg-purple-800/40 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                >
                  📥 Download TXT
                </button>
              </div>
            </h3>

            <textarea
              rows={10}
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className={`w-full p-4 rounded-xl border font-sans text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition ${
                darkMode ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}
            />
          </div>
        )}

        <RecommendedTools currentTool="image-to-text" darkMode={darkMode} />

        <AdsterraBanner />

        {/* ── How to extract text ─────────────────────────────────── */}
        <div className={`${cardCls} mb-6 mt-8`}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-purple-600 rounded-full inline-block"></span>
            How to Convert Image to Text
          </h2>
          <ol className={`space-y-3 text-sm list-none ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {[
              ['1', 'Upload your image or paste it directly from your clipboard.'],
              ['2', 'Select the language corresponding to the text in the image.'],
              ['3', 'Click the "Extract Text" button to start the OCR processing.'],
              ['4', 'Review, edit, or copy the extracted text from the output text area.'],
              ['5', 'Copy to your clipboard or download as a text file.'],
            ].map(([n, text]) => (
              <li key={n} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {n}
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* ── FAQs ──────────────────────────────────────────────── */}
        <div className={`${cardCls} mb-6`}>
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-purple-600 rounded-full inline-block"></span>
            Frequently Asked Questions
          </h2>
          <div className="space-y-5">
            {[
              { q: 'Is my data secure?', a: 'Yes. The image is loaded directly from your device into memory and analyzed client-side. We do not transmit or upload your files to any external server.' },
              { q: 'What kind of images work best?', a: 'High-contrast images with clear, printed text work best. If the text is fuzzy or the background has strong gradients, readability may drop.' },
              { q: 'Can it read handwritten text?', a: 'Yes, if the handwriting is neat, clean, and in print format. Cursive, stylized, or sloppy script may return garbled text.' },
              { q: 'What languages does the OCR support?', a: 'Currently, the tool supports English, Spanish, French, German, Hindi, Arabic, Chinese, and Japanese.' },
              { q: 'Is there a file size limit?', a: 'No strict limit since processing depends on your local device speed and memory. Images under 10MB are recommended for optimal speed.' },
            ].map(({ q, a }) => (
              <div key={q} className={`border-b pb-4 last:border-0 last:pb-0 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <h3 className="font-semibold text-sm mb-1">{q}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SEO Section ───────────────────────────────────────── */}
        <div className={`${cardCls} mb-6`}>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-purple-600 rounded-full inline-block"></span>
            What is an Image to Text (OCR) Tool?
          </h2>
          <p className={`text-sm leading-relaxed mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            An Image to Text Converter uses Optical Character Recognition (OCR) technology to scan characters in an image, convert them into digital machine-readable text, and present them in a standard text editor.
          </p>
          <h3 className="font-bold text-base mb-2">Why Use Client-Side OCR?</h3>
          <ul className={`text-sm space-y-1.5 list-disc list-inside mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <li><strong>Complete Privacy:</strong> Your text notes, sensitive slides, or document screenshots never leave your browser.</li>
            <li><strong>Zero Server Latency:</strong> No wait times for queues or networks; processing completes locally.</li>
            <li><strong>Ideal for Students:</strong> Instant extraction from lecture images or study boards directly to copyable assignments or digital note platforms.</li>
          </ul>
        </div>

        {/* ── Feedback ──────────────────────────────────────────── */}
        <div className={`${cardCls} mb-6 text-center`}>
          <h2 className="text-lg font-bold mb-1">Was this tool helpful?</h2>
          <p className={`text-xs mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Rate your experience</p>
          {!feedbackSubmitted ? (
            <>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackRating(star)}
                    className={`text-2xl transition-transform hover:scale-125 ${star <= feedbackRating ? 'text-yellow-400' : darkMode ? 'text-gray-600' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {feedbackRating > 0 && (
                <>
                  <textarea
                    rows={2}
                    placeholder="Optional: share any feedback…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className={`${inputCls} resize-none mb-3`}
                  />
                  <button
                    onClick={() => setFeedbackSubmitted(true)}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-750 text-white font-semibold rounded-lg text-sm transition"
                  >
                    Submit Feedback
                  </button>
                </>
              )}
            </>
          ) : (
            <p className="text-green-500 font-semibold">🙏 Thank you for your feedback!</p>
          )}
        </div>

        {/* ── Related Tools ─────────────────────────────────────── */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-purple-600 rounded-full inline-block"></span>
            Related Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { to: '/paste-image-converter', label: 'Paste & Convert Image', desc: 'Convert screenshots from your clipboard to any format.' },
              { to: '/upload-image-converter', label: 'Upload & Convert Image', desc: 'Upload images to convert between JPG, PNG, WebP, etc.' },
              { to: '/image-to-pdf', label: 'Image to PDF', desc: 'Combine multiple screenshots or scans into a single PDF.' },
            ].map(({ to, label, desc }) => (
              <Link
                key={to}
                to={to}
                className={`p-4 rounded-xl border hover:border-purple-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <h4 className="font-semibold text-sm mb-1">{label}</h4>
                <p className="text-xs text-gray-500">{desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Related Articles ───────────────────────────────────── */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-purple-600 rounded-full inline-block"></span>
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/blog/ocr-guide-extract-text-from-images-notes"
              className={`p-4 rounded-xl border hover:border-purple-500 transition-all ${
                darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <h4 className="font-semibold text-sm mb-1">OCR Guide: Extract Text from Lecture Images &amp; Notes</h4>
              <p className="text-xs text-gray-500">Learn how to convert screenshots, scanned text, and handwritten notes into editable files locally.</p>
            </Link>
            <Link
              to="/blog/ultimate-image-format-optimization-guide-students-jpg-png-webp-avif-pdf"
              className={`p-4 rounded-xl border hover:border-purple-500 transition-all ${
                darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <h4 className="font-semibold text-sm mb-1">Ultimate Image Format &amp; Optimization Guide</h4>
              <p className="text-xs text-gray-500">Understanding JPG, PNG, WebP, AVIF, and PDF differences and compression secrets.</p>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ImageToTextTool;
