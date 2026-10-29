import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdsterraBanner from './AdsterraBanner';
import RecommendedTools from './RecommendedTools';
import SEO from './SEO';

const SplitPdfTool = ({ darkMode }) => {
  const [file, setFile] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [splitMethod, setSplitMethod] = useState('range'); // 'range' | 'every' | 'custom'
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);
  const [customPages, setCustomPages] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [downloadReady, setDownloadReady] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadName, setDownloadName] = useState('');
  const [isZip, setIsZip] = useState(false);
  const [error, setError] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [comment, setComment] = useState('');

  const fileInputRef = useRef(null);

  // Load pdf-lib from CDN
  const loadPdfLib = () =>
    new Promise((resolve, reject) => {
      if (window.PDFLib) { resolve(window.PDFLib); return; }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
      script.onload = () => resolve(window.PDFLib);
      script.onerror = () => reject(new Error('Failed to load pdf-lib.'));
      document.head.appendChild(script);
    });

  // Load JSZip from CDN
  const loadJSZip = () =>
    new Promise((resolve, reject) => {
      if (window.JSZip) { resolve(window.JSZip); return; }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = () => resolve(window.JSZip);
      script.onerror = () => reject(new Error('Failed to load JSZip.'));
      document.head.appendChild(script);
    });

  useEffect(() => {
    loadPdfLib().catch(() => {});
    loadJSZip().catch(() => {});
  }, []);

  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals < 0 ? 0 : decimals)) + ' ' + sizes[i];
  };

  // Parse custom page string like "1,3,5,8-10" → [0,2,4,7,8,9] (0-indexed)
  const parseCustomPages = (input, total) => {
    const parts = input.split(',').map(s => s.trim()).filter(Boolean);
    const pages = new Set();
    for (const part of parts) {
      if (part.includes('-')) {
        const [a, b] = part.split('-').map(Number);
        if (isNaN(a) || isNaN(b) || a < 1 || b > total || a > b) return null;
        for (let i = a; i <= b; i++) pages.add(i - 1);
      } else {
        const n = Number(part);
        if (isNaN(n) || n < 1 || n > total) return null;
        pages.add(n - 1);
      }
    }
    return [...pages].sort((a, b) => a - b);
  };

  const readFileBuffer = (f) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsArrayBuffer(f);
    });

  const acceptFile = async (f) => {
    if (!f || f.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }
    setError('');
    setDownloadReady(false);
    setDownloadUrl('');
    setStatusMessage('Reading PDF…');
    try {
      const PDFLib = window.PDFLib || await loadPdfLib();
      const buffer = await readFileBuffer(f);
      const pdf = await PDFLib.PDFDocument.load(buffer);
      const pages = pdf.getPageCount();
      setFile(f);
      setTotalPages(pages);
      setFromPage(1);
      setToPage(pages);
      setStatusMessage(`Loaded: ${f.name} — ${pages} page${pages !== 1 ? 's' : ''}`);
    } catch (err) {
      setError('Could not read the PDF. It may be password-protected or corrupted.');
      setStatusMessage('');
    }
  };

  const handleFileChange = (e) => acceptFile(e.target.files[0]);
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    acceptFile(e.dataTransfer.files[0]);
  };

  const handleSplit = async () => {
    if (!file) { setError('Please upload a PDF first.'); return; }
    setError('');
    setDownloadReady(false);
    setIsProcessing(true);
    setProgress(5);

    try {
      const PDFLib = window.PDFLib || await loadPdfLib();
      const JSZip = window.JSZip || await loadJSZip();
      const buffer = await readFileBuffer(file);
      const srcDoc = await PDFLib.PDFDocument.load(buffer);
      setProgress(20);

      // Build array of page-index arrays per output file
      let outputChunks = [];

      if (splitMethod === 'every') {
        // One PDF per page
        outputChunks = Array.from({ length: totalPages }, (_, i) => [i]);
      } else if (splitMethod === 'range') {
        const from = parseInt(fromPage, 10);
        const to = parseInt(toPage, 10);
        if (isNaN(from) || isNaN(to) || from < 1 || to > totalPages || from > to) {
          setError(`Invalid page range. Enter values between 1 and ${totalPages}.`);
          setIsProcessing(false);
          setProgress(0);
          return;
        }
        const indices = [];
        for (let i = from; i <= to; i++) indices.push(i - 1);
        outputChunks = [indices];
      } else {
        // custom
        const indices = parseCustomPages(customPages, totalPages);
        if (!indices || indices.length === 0) {
          setError(`Invalid page selection. Use format like: 1,3,5,8-10 (max page: ${totalPages}).`);
          setIsProcessing(false);
          setProgress(0);
          return;
        }
        outputChunks = [indices];
      }

      setProgress(30);
      setStatusMessage('Splitting PDF…');

      // Build PDF bytes for each chunk
      const pdfBuffers = [];
      for (let ci = 0; ci < outputChunks.length; ci++) {
        const indices = outputChunks[ci];
        const newDoc = await PDFLib.PDFDocument.create();
        const copiedPages = await newDoc.copyPages(srcDoc, indices);
        copiedPages.forEach(p => newDoc.addPage(p));
        const bytes = await newDoc.save();
        pdfBuffers.push(bytes);
        setProgress(30 + Math.round(60 * (ci + 1) / outputChunks.length));
      }

      setProgress(90);

      let url, name;
      if (pdfBuffers.length === 1) {
        // Single output → direct PDF download
        const blob = new Blob([pdfBuffers[0]], { type: 'application/pdf' });
        url = URL.createObjectURL(blob);
        name = 'split-pages.pdf';
        setIsZip(false);
      } else {
        // Multiple outputs → ZIP
        const zip = new JSZip();
        pdfBuffers.forEach((bytes, i) => {
          zip.file(`page-${String(i + 1).padStart(3, '0')}.pdf`, bytes);
        });
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        url = URL.createObjectURL(zipBlob);
        name = 'split-pdf.zip';
        setIsZip(true);
      }

      setDownloadUrl(url);
      setDownloadName(name);
      setDownloadReady(true);
      setProgress(100);
      setStatusMessage(`✅ PDF Split Successfully — ${pdfBuffers.length} file${pdfBuffers.length !== 1 ? 's' : ''} ready`);
    } catch (err) {
      setError('An error occurred while splitting the PDF. Please try again.');
      setStatusMessage('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = downloadName;
    a.click();
  };

  const reset = () => {
    setFile(null);
    setTotalPages(0);
    setFromPage(1);
    setToPage(1);
    setCustomPages('');
    setSplitMethod('range');
    setDownloadReady(false);
    setDownloadUrl('');
    setError('');
    setStatusMessage('');
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Shared input class helper
  const inputCls = `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition ${
    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
  }`;

  const cardCls = `rounded-2xl border p-6 transition-all ${
    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  }`;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <SEO
        title="Split PDF Online Free | Extract Pages from PDF - SmartStudentTools"
        description="Split PDF files into separate documents or extract selected pages online for free. Secure browser-based processing with no uploads or registration required."
        url="https://smartstudenttools.xyz/split-pdf"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Split PDF Tool',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            description: 'Split PDF files into separate documents or extract selected pages online for free. 100% browser-based, no uploads.',
          },
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* ── H1 / Hero ─────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 flex items-center justify-center gap-3">
            <span className="text-4xl">✂️</span> Split PDF
          </h1>
          <p className={`text-sm md:text-base max-w-lg mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Split your PDF into multiple documents or extract selected pages.<br />
            Everything is processed securely in your browser.
          </p>
        </div>

        {/* ── Feature Pills ──────────────────────────────────────── */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            ['✂️', 'Split by Page Range'],
            ['📄', 'Extract Specific Pages'],
            ['🔒', '100% Browser Processing'],
            ['⚡', 'Fast Processing'],
            ['📱', 'Mobile Friendly'],
            ['🆓', 'Free Forever'],
          ].map(([icon, label]) => (
            <span key={label} className={`text-xs px-3 py-1.5 rounded-full font-medium border ${
              darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'
            }`}>{icon} {label}</span>
          ))}
        </div>

        {/* ── Upload Zone ────────────────────────────────────────── */}
        <div className={`${cardCls} mb-6`}>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                : darkMode
                  ? 'border-gray-600 hover:border-red-500'
                  : 'border-gray-300 hover:border-red-400 hover:bg-red-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="text-5xl mb-3">📄</div>
            {file ? (
              <div>
                <p className="font-semibold text-base mb-1">{file.name}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatBytes(file.size)} · {totalPages} page{totalPages !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="mt-3 text-xs text-red-500 hover:text-red-700 underline"
                >
                  Remove &amp; choose another
                </button>
              </div>
            ) : (
              <>
                <p className={`font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Drag &amp; Drop PDF Here
                </p>
                <p className={`text-xs mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>or</p>
                <span className="inline-block px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition">
                  Choose PDF
                </span>
              </>
            )}
          </div>

          {totalPages > 0 && (
            <p className={`text-sm mt-3 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Total Pages: <span className="font-bold text-red-500">{totalPages}</span>
            </p>
          )}
        </div>

        {/* ── Split Options ──────────────────────────────────────── */}
        {file && (
          <div className={`${cardCls} mb-6`}>
            <h2 className="text-lg font-bold mb-4">Split Method</h2>

            {/* Radio group */}
            <div className="space-y-3 mb-6">
              {[
                { value: 'range', label: 'Extract Page Range', desc: 'Choose a from/to page to extract as one PDF.' },
                { value: 'every', label: 'Split Every Page', desc: 'Creates one separate PDF per page.' },
                { value: 'custom', label: 'Custom Pages', desc: 'Enter page numbers and ranges, e.g. 1,3,5,8-10.' },
              ].map(({ value, label, desc }) => (
                <label
                  key={value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    splitMethod === value
                      ? darkMode
                        ? 'border-red-500 bg-red-900/10'
                        : 'border-red-400 bg-red-50'
                      : darkMode
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="splitMethod"
                    value={value}
                    checked={splitMethod === value}
                    onChange={() => setSplitMethod(value)}
                    className="mt-0.5 accent-red-500"
                  />
                  <div>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Range inputs */}
            {splitMethod === 'range' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    From Page
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={fromPage}
                    onChange={(e) => setFromPage(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    To Page
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={toPage}
                    onChange={(e) => setToPage(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            )}

            {/* Custom pages input */}
            {splitMethod === 'custom' && (
              <div>
                <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Custom Pages <span className="font-normal">(e.g. 1,3,5,8-10)</span>
                </label>
                <input
                  type="text"
                  placeholder={`1,3,5,8-10  (max: ${totalPages})`}
                  value={customPages}
                  onChange={(e) => setCustomPages(e.target.value)}
                  className={inputCls}
                />
              </div>
            )}

            {splitMethod === 'every' && (
              <p className={`text-sm rounded-lg px-3 py-2 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                This will create <strong>{totalPages}</strong> separate PDF file{totalPages !== 1 ? 's' : ''}, one per page, packaged into a ZIP.
              </p>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <span>❌</span> <span>{error}</span>
              </div>
            )}

            {/* Split button */}
            <button
              onClick={handleSplit}
              disabled={isProcessing}
              className="mt-6 w-full py-3 bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition text-base shadow-md hover:shadow-lg"
            >
              {isProcessing ? 'Splitting PDF…' : '✂️ Split PDF'}
            </button>

            {/* Progress */}
            {isProcessing && (
              <div className="mt-4">
                <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-2 rounded-full bg-red-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className={`text-xs mt-1 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {statusMessage || 'Processing…'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Success / Download ─────────────────────────────────── */}
        {downloadReady && (
          <div className={`${cardCls} mb-6 border-green-400 text-center`}>
            <div className="text-4xl mb-2">✅</div>
            <h3 className="text-xl font-bold mb-1">PDF Split Successfully</h3>
            <p className={`text-sm mb-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {statusMessage}
            </p>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition shadow-md hover:shadow-lg"
            >
              {isZip ? '📦 Download ZIP' : '📄 Download PDF'}
            </button>
            <button
              onClick={reset}
              className={`ml-3 px-5 py-3 rounded-xl border font-semibold text-sm transition ${
                darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Split Another
            </button>
          </div>
        )}

        {/* Status message (non-error, non-processing) */}
        {!isProcessing && !downloadReady && statusMessage && !error && (
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{statusMessage}</p>
        )}

        <RecommendedTools currentTool="split-pdf" darkMode={darkMode} />

        <AdsterraBanner />
        <div className={`${cardCls} mb-6 mt-8`}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-red-500 rounded-full inline-block"></span>
            How to Split a PDF
          </h2>
          <ol className={`space-y-3 text-sm list-none ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {[
              ['1', 'Upload your PDF using drag & drop or the file chooser.'],
              ['2', 'Select a split method: page range, every page, or custom.'],
              ['3', 'Enter your page selection or range.'],
              ['4', 'Click Split PDF and wait for processing.'],
              ['5', 'Download the resulting PDF or ZIP file.'],
            ].map(([n, text]) => (
              <li key={n} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {n}
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* ── Split Options Explained ────────────────────────────── */}
        <div className={`${cardCls} mb-6`}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-red-500 rounded-full inline-block"></span>
            Split Options
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: '📑',
                title: 'Split Every Page',
                desc: 'Creates one PDF per page. All pages are packaged into a ZIP for download.',
                example: null,
              },
              {
                icon: '📋',
                title: 'Extract Page Range',
                desc: 'Produces one PDF containing the pages you specify.',
                example: 'From: 4  →  To: 10',
              },
              {
                icon: '🎯',
                title: 'Custom Pages',
                desc: 'Extracts only the pages and ranges you list into a single PDF.',
                example: '1,3,5,8-12',
              },
            ].map(({ icon, title, desc, example }) => (
              <div key={title} className={`rounded-xl p-4 border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="text-2xl mb-2">{icon}</div>
                <h3 className="font-bold text-sm mb-1">{title}</h3>
                <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
                {example && (
                  <code className={`text-xs px-2 py-1 rounded font-mono ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>
                    {example}
                  </code>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQs ──────────────────────────────────────────────── */}
        <div className={`${cardCls} mb-6`}>
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-red-500 rounded-full inline-block"></span>
            Frequently Asked Questions
          </h2>
          <div className="space-y-5">
            {[
              { q: 'Is my PDF uploaded to a server?', a: 'No. Everything happens inside your browser using JavaScript. Your file never leaves your device.' },
              { q: 'Can I split large PDFs?', a: 'Yes. The only limitation is your device\'s available memory. Most PDFs work without any issues.' },
              { q: 'Can I extract only one page?', a: 'Yes. Simply enter the same page number for From and To in page range mode, or enter a single number in custom pages mode.' },
              { q: 'Will the quality change?', a: 'No. The extracted pages retain their original quality, fonts, images, and layout.' },
              { q: 'Is this tool free?', a: 'Yes, completely free with no registration required — and it always will be.' },
              { q: 'What does the ZIP file contain?', a: 'When you split every page or select multiple pages, each output is a separate PDF file. They are all bundled into a single ZIP for easy downloading.' },
            ].map(({ q, a }) => (
              <div key={q} className={`border-b pb-4 last:border-0 last:pb-0 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <h3 className="font-semibold text-sm mb-1">{q}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SEO Content ───────────────────────────────────────── */}
        <div className={`${cardCls} mb-6`}>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-red-500 rounded-full inline-block"></span>
            What is a Split PDF Tool?
          </h2>
          <p className={`text-sm leading-relaxed mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            A Split PDF tool allows you to divide a PDF document into smaller files or extract only the pages you need.
            It is useful for separating chapters, sharing specific sections, or removing unnecessary pages from large documents.
          </p>
          <h3 className="font-bold text-base mb-2">Why Split a PDF?</h3>
          <ul className={`text-sm space-y-1.5 list-disc list-inside mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>Extract only important pages from a large report.</li>
            <li>Separate chapters or sections for easier sharing.</li>
            <li>Share selected pages without sending the entire document.</li>
            <li>Reduce file size by keeping only the content you need.</li>
            <li>Organize study notes and lecture slides efficiently.</li>
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
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg text-sm transition"
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
            <span className="w-1.5 h-6 bg-red-500 rounded-full inline-block"></span>
            Related Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { to: '/merge-pdf', label: 'Merge PDF', desc: 'Combine multiple PDFs into one document.' },
              { to: '/lock-pdf', label: 'Lock PDF', desc: 'Protect your PDF with a secure password.' },
              { to: '/unlock-pdf', label: 'Unlock PDF', desc: 'Remove the password from a protected PDF.' },
            ].map(({ to, label, desc }) => (
              <Link
                key={to}
                to={to}
                className={`p-4 rounded-xl border hover:border-red-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <h4 className="font-semibold text-sm mb-1">{label}</h4>
                <p className="text-xs text-gray-500">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitPdfTool;
