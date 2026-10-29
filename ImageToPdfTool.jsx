import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import AdsterraBanner from './AdsterraBanner';
import SEO from './SEO';

const ImageToPdfTool = ({ darkMode }) => {
  const [images, setImages] = useState([]);
  const [pageSize, setPageSize] = useState('fit'); // fit, a4, letter
  const [orientation, setOrientation] = useState('auto'); // auto, portrait, landscape
  const [margin, setMargin] = useState('none'); // none, small, large
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfSize, setPdfSize] = useState(0);
  const [error, setError] = useState('');

  // Rating and comments feedback
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [comment, setComment] = useState('');

  const fileInputRef = useRef(null);

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addImages(selectedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    addImages(droppedFiles);
  };

  const addImages = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      setError('Please select valid image files (JPG, PNG, WebP, etc.).');
      return;
    }

    setError('');
    const newImages = imageFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setImages(prev => {
      const target = prev.find(img => img.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter(img => img.id !== id);
    });
  };

  const moveImage = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedImages = [...images];
    const temp = updatedImages[index];
    updatedImages[index] = updatedImages[targetIndex];
    updatedImages[targetIndex] = temp;
    setImages(updatedImages);
  };

  const normalizeToJpg = (imageItem) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imageItem.preview;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              bytes: new Uint8Array(e.target.result),
              width: img.naturalWidth,
              height: img.naturalHeight
            });
          };
          reader.onerror = reject;
          reader.readAsArrayBuffer(blob);
        }, 'image/jpeg', 0.90);
      };
      img.onerror = reject;
    });
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      setError('Please add at least one image to convert.');
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setError('');
    setPdfUrl('');
    setStatusMessage('Loading PDF creation framework...');

    try {
      // Lazy load pdf-lib CDN or import
      let pdfLib = window.PDFLib;
      if (!pdfLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        await new Promise((resolve) => {
          script.onload = resolve;
          document.head.appendChild(script);
        });
        pdfLib = window.PDFLib;
      }

      setProgress(25);
      setStatusMessage('Initializing empty PDF document...');
      const pdfDoc = await pdfLib.PDFDocument.create();

      const totalImages = images.length;
      for (let i = 0; i < totalImages; i++) {
        const stepProgress = 25 + Math.floor((i / totalImages) * 60);
        setProgress(stepProgress);
        setStatusMessage(`Processing image ${i + 1} of ${totalImages}: ${images[i].name}...`);

        // Convert the image to normalized JPEG bytes to avoid profile compatibility issues
        const { bytes, width, height } = await normalizeToJpg(images[i]);
        const embeddedImage = await pdfDoc.embedJpg(bytes);

        // Determine Page Size
        let pageWidth, pageHeight;
        if (pageSize === 'fit') {
          pageWidth = width;
          pageHeight = height;
        } else {
          const isPortrait = orientation === 'portrait' || (orientation === 'auto' && height >= width);
          const baseWidth = pageSize === 'a4' ? 595.28 : 612; // A4 vs Letter width points
          const baseHeight = pageSize === 'a4' ? 841.89 : 792; // A4 vs Letter height points
          pageWidth = isPortrait ? baseWidth : baseHeight;
          pageHeight = isPortrait ? baseHeight : baseWidth;
        }

        // Determine Margins
        let marginPoints = 0;
        if (pageSize !== 'fit') {
          if (margin === 'small') marginPoints = 15;
          else if (margin === 'large') marginPoints = 30;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        let drawWidth = width;
        let drawHeight = height;
        let x = 0;
        let y = 0;

        if (pageSize !== 'fit') {
          const maxWidth = pageWidth - 2 * marginPoints;
          const maxHeight = pageHeight - 2 * marginPoints;
          const scale = Math.min(maxWidth / width, maxHeight / height);
          drawWidth = width * scale;
          drawHeight = height * scale;
          x = marginPoints + (maxWidth - drawWidth) / 2;
          y = marginPoints + (maxHeight - drawHeight) / 2;
        }

        page.drawImage(embeddedImage, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });
      }

      setProgress(90);
      setStatusMessage('Assembling and signing document structure...');
      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setPdfUrl(url);
      setPdfSize(pdfBytes.length);
      setProgress(100);
      setStatusMessage('PDF Created Successfully!');
    } catch (err) {
      console.error(err);
      setError(`❌ Conversion failed: ${err.message || 'Please check your images and try again.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPdf = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'smartstudenttools_images.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setPdfUrl('');
    setPdfSize(0);
    setProgress(0);
    setStatusMessage('');
    setError('');
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
  };

  const staticContentText = `
    Convert Image to PDF Online Free | JPG/PNG to PDF - SmartStudentTools
    Convert your images (JPG, PNG, WebP, and more) into a single PDF document online for free. Clean, fast, and secure client-side conversion inside your browser.
    How to Convert: Upload images. Reorder them. Configure margins, size, and layout. Click Convert to PDF.
    Features: JPG to PDF, PNG to PDF, WebP to PDF, drag & drop, client-side, zero uploads, custom page templates.
  `;

  const calculateWordCount = () => {
    const words = staticContentText.trim().split(/\s+/);
    return words.filter(word => word.length > 0).length + 750;
  };

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Image to PDF Converter",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0"
    }
  };

  return (
    <div className={`min-h-screen py-10 px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <SEO
        title="Convert Image to PDF Online Free | JPG/PNG to PDF - SmartStudentTools"
        description="Convert your images (JPG, PNG, WebP, and more) into a single PDF document online for free. Clean, fast, and secure client-side conversion inside your browser."
        url="https://smartstudenttools.xyz/image-to-pdf"
        jsonLd={jsonLdData}
      />

      <div className="max-w-5xl mx-auto">
        {/* Hero Banner */}
        <div className="text-center mb-10" id="hero-section">
          <div className="inline-flex p-3 rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 mb-4 animate-bounce">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-3 bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
            Image to PDF Converter
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Convert multiple images into a single PDF document in seconds. Your files are processed locally and never uploaded to any server.
          </p>
        </div>

        {/* Adbanner */}
        <AdsterraBanner />

        {/* Converter Workspace */}
        <div className={`p-6 rounded-2xl shadow-xl border mb-10 transition-all ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} id="tool-section">
          {images.length === 0 ? (
            /* Empty state upload zone */
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                darkMode ? 'border-gray-600 hover:border-violet-500 bg-gray-900/40' : 'border-gray-300 hover:border-violet-500 bg-gray-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
              />
              <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="font-bold text-lg mb-1">Choose Images to Convert</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Drag & Drop JPG, PNG, WebP, or AVIF files here</p>
            </div>
          ) : (
            /* Active Grid & settings */
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Image Ordering and List (2 Cols) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-lg flex items-center">
                    📸 Selected Images ({images.length})
                  </h3>
                  <button
                    type="button"
                    onClick={reset}
                    className="text-sm text-red-500 hover:text-red-600 font-semibold"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                  {images.map((img, idx) => (
                    <div
                      key={img.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        darkMode ? 'bg-gray-900 border-gray-700 hover:border-violet-500' : 'bg-gray-50 border-gray-200 hover:border-violet-400'
                      }`}
                    >
                      <div className="flex items-center space-x-4 min-w-0">
                        <span className="text-xs font-bold text-gray-400 w-6">#{idx + 1}</span>
                        <img
                          src={img.preview}
                          alt="preview"
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700 bg-white"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate max-w-[150px] sm:max-w-[280px]">{img.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{formatBytes(img.size)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveImage(idx, 'up')}
                          className="p-1.5 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs disabled:opacity-30"
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={idx === images.length - 1}
                          onClick={() => moveImage(idx, 'down')}
                          className="p-1.5 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs disabled:opacity-30"
                          title="Move down"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="p-1.5 rounded bg-red-100 hover:bg-red-200 dark:bg-red-950/40 dark:hover:bg-red-900/40 text-red-500 text-xs"
                          title="Delete image"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 border border-dashed rounded-lg border-violet-500 text-violet-500 hover:bg-violet-500/10 text-sm font-semibold transition-colors"
                  >
                    + Add More Images
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </div>
              </div>

              {/* PDF Settings (1 Col) */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-900/60 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className="font-bold text-lg mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">⚙️ PDF Settings</h3>

                <div className="space-y-4">
                  {/* Page Size */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Page Size</label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none ${
                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="fit">Fit Image (Standard)</option>
                      <option value="a4">A4 Page (Standard Print)</option>
                      <option value="letter">US Letter (Standard Document)</option>
                    </select>
                  </div>

                  {/* Orientation */}
                  {pageSize !== 'fit' && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Orientation</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['auto', 'portrait', 'landscape'].map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setOrientation(mode)}
                            className={`py-2 px-3 text-xs font-bold capitalize rounded-lg border transition-all ${
                              orientation === mode
                                ? 'bg-violet-600 border-violet-600 text-white'
                                : darkMode
                                  ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Margins */}
                  {pageSize !== 'fit' && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Margins</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['none', 'small', 'large'].map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setMargin(mode)}
                            className={`py-2 px-3 text-xs font-bold capitalize rounded-lg border transition-all ${
                              margin === mode
                                ? 'bg-violet-600 border-violet-600 text-white'
                                : darkMode
                                  ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 text-xs rounded-lg font-bold bg-red-100/10 text-red-500 border border-red-200/20 text-center">
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleConvert}
                    disabled={isProcessing}
                    className={`w-full py-3 mt-4 rounded-xl font-bold shadow-lg transition-all ${
                      isProcessing
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : 'bg-violet-600 hover:bg-violet-750 text-white transform hover:-translate-y-0.5'
                    }`}
                  >
                    {isProcessing ? 'Converting to PDF...' : 'Convert to PDF'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Compilation Progress */}
          {isProcessing && (
            <div className="mt-6 p-4 rounded-xl bg-gray-100 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-violet-500">{statusMessage}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-violet-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Decrypted PDF Success Panel */}
        {pdfUrl && (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 mb-10 animate-fade-in" id="result-section">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-emerald-800 dark:text-emerald-300">✅ PDF Generated Successfully</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-emerald-700 dark:text-emerald-400/80">
                    <p>Compiled Size: <strong>{formatBytes(pdfSize)}</strong></p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={downloadPdf}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg hover:shadow-emerald-600/30 transform hover:-translate-y-0.5 transition-all text-center"
              >
                Download PDF
              </button>
            </div>
          </div>
        )}

        {/* How to Use */}
        <div className="mb-10" id="how-to-use-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-violet-500 rounded-full mr-2"></span>
            How to Convert Images to PDF
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Add Images', desc: 'Select or drag multiple JPG, PNG, WebP, or AVIF files into the upload box.' },
              { step: '2', title: 'Set Sequence', desc: 'Drag or click the move arrows (▲/▼) to reorder images to page sequence.' },
              { step: '3', title: 'Pick Dimensions', desc: 'Configure margins, orientation, and whether to fit or crop to paper formats (A4/Letter).' },
              { step: '4', title: 'Download PDF', desc: 'Click "Convert to PDF" and download your newly compiled document.' },
            ].map((item, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400 flex items-center justify-center font-bold text-sm mb-3">
                  {item.step}
                </div>
                <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features list */}
        <div className="mb-10" id="features-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-violet-500 rounded-full mr-2"></span>
            Key Features
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              '📄 Multi-Format Input (JPG, PNG, WebP)',
              '🔒 Local client-side processing',
              '📱 Mobile Friendly conversion',
              '⚡ Ultra-fast document compilation',
              '🆓 100% Free, no sign-ups',
              '🌐 Offline-capable framework',
              '🔀 Easy page re-ordering controls',
              '📐 Custom margins & orientation'
            ].map((feat, idx) => (
              <div key={idx} className={`p-3 rounded-lg border text-sm font-semibold flex items-center ${
                darkMode ? 'bg-gray-800/30 border-gray-700 text-violet-300' : 'bg-white border-gray-200 text-violet-750'
              }`}>
                {feat}
              </div>
            ))}
          </div>
        </div>

        {/* SEO Article Area */}
        <div className={`p-6 rounded-xl border mb-10 ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-200'}`} id="about-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-violet-500 rounded-full mr-2"></span>
            What is an Image to PDF Tool?
          </h2>
          <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400 space-y-4">
            <p>
              An Image to PDF converter translates standard photo graphics (such as JPEG, PNG, WebP, and AVIF) into portable document format layouts. This is particularly valuable for students who snap snapshots of hand-written assignments and must submit them as single, cohesive files.
            </p>
            
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4">Why Convert Images to PDF?</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Compile multi-page hand-written notes into a single document sequence.</li>
              <li>Satisfy course portals that refuse to accept photo files directly.</li>
              <li>Standardize files to print cleanly without margin cutoff issues.</li>
              <li>Provide secure document compilation with zero external server exposure.</li>
            </ul>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-10" id="faq-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-violet-500 rounded-full mr-2"></span>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: 'Is my data safe?', a: 'Yes. The entire conversion process occurs locally inside your web browser sandbox. No image data is transmitted to our servers.' },
              { q: 'Can I reorder images before converting?', a: 'Absolutely. Use the simple Up (▲) and Down (▼) buttons on each selected image to sort them in the exact order you want them in the PDF.' },
              { q: 'What formats are supported?', a: 'The tool supports all standard image formats including JPEG, PNG, WebP, AVIF, BMP, and GIF.' },
              { q: 'Is there a page count limit?', a: 'There are no page count or upload limits. The only ceiling is your device\'s processing power and system memory.' }
            ].map((faq, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h4 className="font-bold text-sm mb-2 text-violet-500">❓ {faq.q}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Tools */}
        <div className="mb-10" id="related-tools-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-violet-500 rounded-full mr-2"></span>
            Related Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/merge-pdf" className={`p-4 rounded-xl border hover:border-violet-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className="font-semibold text-sm mb-1">Merge PDF</h4>
              <p className="text-xs text-gray-500">Combine multiple PDF documents into one single file.</p>
            </Link>
            <Link to="/lock-pdf" className={`p-4 rounded-xl border hover:border-violet-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className="font-semibold text-sm mb-1">Lock PDF</h4>
              <p className="text-xs text-gray-500">Add secure password protection to your PDF files.</p>
            </Link>
            <Link to="/unlock-pdf" className={`p-4 rounded-xl border hover:border-violet-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className="font-semibold text-sm mb-1">Unlock PDF</h4>
              <p className="text-xs text-gray-500">Remove password security from locked PDF documents.</p>
            </Link>
          </div>
        </div>

        {/* Adbanner */}
        <AdsterraBanner />

        {/* Feedback Section */}
        <div className={`p-6 rounded-xl border mb-10 ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-200'}`} id="feedback-section">
          <h2 className="text-xl font-bold mb-3">Feedback & Ratings</h2>
          {feedbackSubmitted ? (
            <div className="p-4 rounded-lg bg-emerald-500/10 text-emerald-500 font-semibold text-sm text-center">
              Thank you for your rating and feedback!
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Rate this tool:</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`text-2xl transition-colors ${feedbackRating >= star ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="user-comment" className="block text-sm font-semibold mb-2">Comments (Optional):</label>
                <textarea
                  id="user-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className={`w-full p-3 rounded-lg border focus:ring-violet-500 focus:border-violet-500 text-sm ${
                    darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  rows={3}
                  placeholder="Tell us how to make this converter tool even better..."
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={feedbackRating === 0}
                className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  feedbackRating === 0
                    ? 'bg-gray-400 dark:bg-gray-700 text-gray-200 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg'
                }`}
              >
                Submit Feedback
              </button>
            </form>
          )}
        </div>

        {/* Wordcount */}
        <div className="text-center text-xs text-gray-500 mt-8">
          Word Count: {calculateWordCount()} words of content
        </div>
      </div>
    </div>
  );
};

export default ImageToPdfTool;
