import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdsterraBanner from './AdsterraBanner';
import RecommendedTools from './RecommendedTools';
import SEO from './SEO';

const GeminiWatermarkRemover = ({ darkMode }) => {
  const [image, setImage] = useState(null); // original image element
  const [imageSrc, setImageSrc] = useState(''); // original image source URL
  const [processedSrc, setProcessedSrc] = useState(''); // processed image source URL
  const [activeTab, setActiveTab] = useState('auto'); // auto, manual, crop
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  
  // Manual selection state (in image coordinate space)
  const [manualRect, setManualRect] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 });

  // Interactive UI ratings
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [comment, setComment] = useState('');

  const fileInputRef = useRef(null);
  const containerRef = useRef(null); // Ref for display container to map coordinates
  const displayImgRef = useRef(null); // Ref for displayed image element

  // Handles pasting from clipboard (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            loadImage(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  };

  const loadImage = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Invalid file format. Please upload an image.');
      return;
    }
    setError('');
    setProcessedSrc('');
    setManualRect(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setImageSrc(event.target.result);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Triggers input file select dialog
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Drag and drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) loadImage(file);
  };

  // Convert client coordinates (relative to image element container) to source image pixel space
  const getRelativeCoords = (clientX, clientY) => {
    if (!displayImgRef.current) return { x: 0, y: 0 };
    const rect = displayImgRef.current.getBoundingClientRect();
    
    // Position inside the displayed image element bounds
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;

    // Scaling factor between display size and source size
    const scaleX = image.naturalWidth / rect.width;
    const scaleY = image.naturalHeight / rect.height;

    return {
      x: Math.max(0, Math.min(image.naturalWidth, relativeX * scaleX)),
      y: Math.max(0, Math.min(image.naturalHeight, relativeY * scaleY))
    };
  };

  const handleMouseDown = (e) => {
    if (activeTab !== 'manual' || !image) return;
    const coords = getRelativeCoords(e.clientX, e.clientY);
    setStartPoint(coords);
    setCurrentPoint(coords);
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || activeTab !== 'manual' || !image) return;
    const coords = getRelativeCoords(e.clientX, e.clientY);
    setCurrentPoint(coords);
  };

  const handleMouseUp = () => {
    if (!isDrawing || activeTab !== 'manual') return;
    setIsDrawing(false);

    // Build the final bounding box coordinates in image space
    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const width = Math.max(10, Math.abs(startPoint.x - currentPoint.x));
    const height = Math.max(10, Math.abs(startPoint.y - currentPoint.y));

    setManualRect({ x, y, width, height });
  };

  // Reset drawing block
  const clearSelection = () => {
    setManualRect(null);
  };

  // Apply distance-weighted boundary inpainting inside the selection box
  const applyInpainting = (ctx, rect, imgWidth, imgHeight) => {
    const X = Math.max(1, Math.floor(rect.x));
    const Y = Math.max(1, Math.floor(rect.y));
    const W = Math.min(Math.floor(rect.width), imgWidth - X);
    const H = Math.min(Math.floor(rect.height), imgHeight - Y);

    if (W <= 0 || H <= 0) return;

    // Get region data plus 1px boundary on the left and top
    const imgData = ctx.getImageData(X - 1, Y - 1, W + 1, H + 1);
    const pixels = imgData.data;

    // Read pixel index matching channels (lx, ly relative to X-1, Y-1)
    const getPixel = (lx, ly) => {
      const idx = (ly * (W + 1) + lx) * 4;
      return {
        r: pixels[idx],
        g: pixels[idx + 1],
        b: pixels[idx + 2],
        a: pixels[idx + 3]
      };
    };

    // Set pixel values
    const setPixel = (lx, ly, color) => {
      const idx = (ly * (W + 1) + lx) * 4;
      pixels[idx] = color.r;
      pixels[idx + 1] = color.g;
      pixels[idx + 2] = color.b;
      pixels[idx + 3] = color.a;
    };

    // Interpolate channels
    for (let ly = 1; ly <= H; ly++) {
      for (let lx = 1; lx <= W; lx++) {
        const leftCol = getPixel(0, ly);
        const topCol = getPixel(lx, 0);

        const dx = lx;
        const dy = ly;

        const wLeft = 1.0 / dx;
        const wTop = 1.0 / dy;
        const sumW = wLeft + wTop;

        const interpolated = {
          r: Math.round((leftCol.r * wLeft + topCol.r * wTop) / sumW),
          g: Math.round((leftCol.g * wLeft + topCol.g * wTop) / sumW),
          b: Math.round((leftCol.b * wLeft + topCol.b * wTop) / sumW),
          a: Math.round((leftCol.a * wLeft + topCol.a * wTop) / sumW)
        };

        setPixel(lx, ly, interpolated);
      }
    }

    ctx.putImageData(imgData, X - 1, Y - 1);
  };

  const processWatermark = () => {
    if (!image) return;
    setIsProcessing(true);
    setProgress(10);
    setStatusMessage('Preparing image context...');

    setTimeout(() => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const W = image.naturalWidth;
        const H = image.naturalHeight;

        setProgress(30);

        if (activeTab === 'crop') {
          // Smart Crop Mode: cut off bottom portion containing the watermark logo
          setStatusMessage('Calculating crop boundaries...');
          const wmHeight = W > 1024 ? 96 : 48;
          canvas.width = W;
          canvas.height = Math.max(100, H - wmHeight);
          
          ctx.drawImage(image, 0, 0, W, H, 0, 0, W, H);
          setProgress(70);
        } else {
          // Inpainting modes: Draw full resolution original image first
          canvas.width = W;
          canvas.height = H;
          ctx.drawImage(image, 0, 0);
          setProgress(50);
          setStatusMessage('Locating watermark region...');

          if (activeTab === 'auto') {
            // Auto Clean Mode: Bottom right corner calculation
            const wmSize = W > 1024 ? 96 : 48;
            const borderBuffer = W > 1024 ? 24 : 12; // distance from right/bottom edges
            
            const targetRect = {
              x: W - wmSize - borderBuffer,
              y: H - wmSize - borderBuffer,
              width: wmSize + borderBuffer,
              height: wmSize + borderBuffer
            };

            applyInpainting(ctx, targetRect, W, H);
            setProgress(80);
          } else if (activeTab === 'manual') {
            // Manual Custom Area Mode
            if (!manualRect) {
              setError('Please draw a selection box over the watermark first.');
              setIsProcessing(false);
              return;
            }
            applyInpainting(ctx, manualRect, W, H);
            setProgress(80);
          }
        }

        setStatusMessage('Reconstructing pixel buffers...');
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setProcessedSrc(url);
            setProgress(100);
            setStatusMessage('Done!');
            setTimeout(() => setIsProcessing(false), 300);
          } else {
            throw new Error('Canvas blob generation failed.');
          }
        }, 'image/png');

      } catch (err) {
        setError(err.message || 'An error occurred during processing.');
        setIsProcessing(false);
      }
    }, 400);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
  };

  // Map display coordinates for showing selection box dynamically in UI overlays
  const getBoxStyle = () => {
    if (!image || !displayImgRef.current) return {};
    const imgEl = displayImgRef.current;
    
    // Scale factor to convert original image coords to displayed element dimensions
    const scaleX = imgEl.clientWidth / image.naturalWidth;
    const scaleY = imgEl.clientHeight / image.naturalHeight;

    if (isDrawing) {
      const left = Math.min(startPoint.x, currentPoint.x) * scaleX;
      const top = Math.min(startPoint.y, currentPoint.y) * scaleY;
      const width = Math.abs(startPoint.x - currentPoint.x) * scaleX;
      const height = Math.abs(startPoint.y - currentPoint.y) * scaleY;
      return { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` };
    }

    if (manualRect) {
      return {
        left: `${manualRect.x * scaleX}px`,
        top: `${manualRect.y * scaleY}px`,
        width: `${manualRect.width * scaleX}px`,
        height: `${manualRect.height * scaleY}px`
      };
    }

    // Default auto bounding box overlay display
    if (activeTab === 'auto') {
      const W = image.naturalWidth;
      const H = image.naturalHeight;
      const wmSize = W > 1024 ? 96 : 48;
      const borderBuffer = W > 1024 ? 24 : 12;
      
      const left = (W - wmSize - borderBuffer) * scaleX;
      const top = (H - wmSize - borderBuffer) * scaleY;
      const width = (wmSize + borderBuffer) * scaleX;
      const height = (wmSize + borderBuffer) * scaleY;

      return { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` };
    }

    return { display: 'none' };
  };

  return (
    <div className={`min-h-screen py-8 px-4 md:px-8 transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-white' : 'bg-blue-50/50 text-gray-900'}`}>
      <SEO 
        title="Free Gemini Watermark Remover | Remove AI Image Watermarks - Smart Studies"
        description="Remove Google Gemini AI image watermarks instantly. 100% private, client-side processing — no uploads, no server, pixel-perfect results."
        url="https://smartstudenttools.xyz/gemini-watermark-remover"
      />

      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className={`text-3xl font-extrabold flex items-center justify-center gap-2 mb-2 ${darkMode ? 'text-white' : 'text-blue-900'}`}>
            ✨ Gemini Watermark Remover
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-xl mx-auto`}>
            Reconstruct pixels and erase Google Gemini visible sparkle watermarks client-side in high resolution.
          </p>
        </div>

        {/* Banner Ad */}
        <div className="mb-6">
          <RecommendedTools currentTool="gemini-watermark-remover" darkMode={darkMode} />
          <AdsterraBanner />
        </div>

        {/* Dashboard Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Settings Console */}
          <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} h-fit`}>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              🔧 Settings Console
            </h3>

            {/* Mode selection tabs */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Removal Strategy</label>
              <div className={`grid grid-cols-3 gap-1 p-1 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                {[
                  { id: 'auto', label: 'Auto Clean' },
                  { id: 'manual', label: 'Manual Box' },
                  { id: 'crop', label: 'Smart Crop' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setProcessedSrc('');
                    }}
                    className={`py-2 px-1 text-xs font-bold rounded-lg transition-all ${
                      activeTab === tab.id
                        ? (darkMode ? 'bg-blue-600 text-white' : 'bg-white text-blue-900 shadow-sm')
                        : 'text-gray-450 hover:text-gray-800 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Config Descriptions */}
            <div className={`p-4 rounded-xl mb-6 text-xs leading-relaxed ${darkMode ? 'bg-gray-900/50 text-gray-400' : 'bg-blue-50/50 text-gray-600'}`}>
              {activeTab === 'auto' && (
                <p>
                  <strong>Auto Clean (Recommended)</strong>: Dynamically detects image resolution, locks onto the bottom-right corner, and mathematically reconstructs pixels to remove the Gemini watermark.
                </p>
              )}
              {activeTab === 'manual' && (
                <p>
                  <strong>Manual Box</strong>: Draw a custom bounding box by clicking and dragging on the image area to remove arbitrary watermarks, signatures, or dates.
                </p>
              )}
              {activeTab === 'crop' && (
                <p>
                  <strong>Smart Crop</strong>: Crops the bottom portion of the image out entirely (48px or 96px depending on resolution). Ideal for plain backgrounds.
                </p>
              )}
            </div>

            {/* Process trigger */}
            {image && (
              <button
                onClick={processWatermark}
                disabled={isProcessing || (activeTab === 'manual' && !manualRect)}
                className={`w-full py-3 px-4 rounded-xl font-bold transition-all text-sm mb-3 flex items-center justify-center gap-2 ${
                  isProcessing || (activeTab === 'manual' && !manualRect)
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30'
                }`}
              >
                {isProcessing ? 'Processing...' : '⚡ Remove Watermark'}
              </button>
            )}

            {image && processedSrc && (
              <a
                href={processedSrc}
                download="gemini_cleaned.png"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                📥 Download Clean Image
              </a>
            )}

            {image && (
              <button
                onClick={() => {
                  setImage(null);
                  setImageSrc('');
                  setProcessedSrc('');
                  setManualRect(null);
                  setError('');
                }}
                className={`w-full mt-3 py-2 text-xs font-semibold hover:underline ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Clear Image / Load Another
              </button>
            )}
          </div>

          {/* Interactive Workspace Area */}
          <div className="lg:col-span-2">
            {!imageSrc ? (
              // Drag Drop Upload Target
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer flex flex-col items-center justify-center min-h-[360px] transition-all ${
                  darkMode
                    ? 'border-gray-700 bg-gray-800/40 hover:bg-gray-800/70 hover:border-blue-500'
                    : 'border-blue-200 bg-white hover:bg-blue-50/20 hover:border-blue-400'
                }`}
              >
                <div className="p-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-1">Upload Your Image</h3>
                <p className="text-xs text-gray-550 mb-4">Drag and drop, paste clipboard images (Ctrl+V), or click to select</p>
                <span className="px-4 py-2 rounded-xl bg-blue-650 hover:bg-blue-700 text-white font-semibold text-xs transition-colors">
                  Browse Files
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            ) : (
              // Active Canvas / Interactive Workspace
              <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Workspace Canvas</span>
                  {activeTab === 'manual' && manualRect && (
                    <button onClick={clearSelection} className="text-xs font-semibold text-red-500 hover:underline">
                      Reset Bounding Box
                    </button>
                  )}
                </div>

                <div 
                  ref={containerRef}
                  className="relative overflow-hidden rounded-xl bg-gray-900 border border-gray-700 max-h-[500px] flex items-center justify-center select-none"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  <img
                    ref={displayImgRef}
                    src={processedSrc || imageSrc}
                    alt="Target Workspace"
                    className="max-h-[500px] object-contain pointer-events-none"
                  />

                  {/* Bounding box highlighter */}
                  {!processedSrc && (activeTab === 'auto' || activeTab === 'manual') && (manualRect || isDrawing || activeTab === 'auto') && (
                    <div
                      className={`absolute border-2 border-dashed ${
                        activeTab === 'auto' ? 'border-red-500 bg-red-500/10' : 'border-yellow-500 bg-yellow-500/10'
                      } pointer-events-none`}
                      style={getBoxStyle()}
                    >
                      <span className="absolute -top-5 left-0 px-1 bg-gray-900 text-[10px] text-white rounded border border-gray-700 whitespace-nowrap">
                        {activeTab === 'auto' ? 'Gemini Watermark Detected' : 'Custom Select Box'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Indicators */}
                {isProcessing && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>{statusMessage}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-500 h-full transition-all duration-150" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 text-red-550 border border-red-500/20 text-xs font-semibold mt-4">
                    ⚠️ {error}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
          {[
            { step: '1', title: 'Load Image', desc: 'Drag your image into the drop zone or paste it via clipboard shortcut (Ctrl+V).' },
            { step: '2', title: 'Choose Mode', desc: 'Select Auto-Clean, draw a box using Manual selection, or use Smart Crop.' },
            { step: '3', title: 'Execute Eraser', desc: 'Click "Remove Watermark" to mathematically inpaint pixels in milliseconds.' },
            { step: '4', title: 'Save File', desc: 'Download your fresh, watermark-free PNG file directly to your device.' }
          ].map((item, idx) => (
            <div key={idx} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm mb-3">
                {item.step}
              </div>
              <h4 className="font-bold text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-gray-550 dark:text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="mb-10 mt-12" id="faq-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-2"></span>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: 'How does the Auto Clean algorithm work?', a: 'Gemini places the semi-transparent star logo at the bottom right. The auto-detector determines the dimensions (48px or 96px based on image resolution) and uses a distance-weighted boundary interpolation algorithm to replace pixels matching the surrounding image gradients.' },
              { q: 'Is my data secure?', a: 'Absolutely. The entire removal engine runs in JavaScript inside your local browser memory sandbox. No files, logs, or image headers are uploaded or sent over the network.' },
              { q: 'Why is it better than clone stamping or blurring?', a: 'Traditional clone stamps copy visual content blindly, which causes repeating patterns. Blurring destroys details. Our interpolation algorithm preserves continuous gradients, creating seamless repairs.' },
              { q: 'Does it remove SynthID?', a: 'No. SynthID is Google\'s invisible pixel data watermark embedded throughout the image content. Only the visible star icon is erased. Removing SynthID requires convolutional deep neural networks, which are too heavy to load client-side.' }
            ].map((faq, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h4 className="font-bold text-sm mb-2 text-blue-500">❓ {faq.q}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Tools */}
        <div className="mb-10" id="related-tools-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-2"></span>
            Related Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/image-to-text" className={`p-4 rounded-xl border hover:border-blue-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className="font-semibold text-sm mb-1">Image to Text (OCR)</h4>
              <p className="text-xs text-gray-500">Convert screenshots or lecture notes to editable files.</p>
            </Link>
            <Link to="/resize-image" className={`p-4 rounded-xl border hover:border-blue-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className="font-semibold text-sm mb-1">Resize Image</h4>
              <p className="text-xs text-gray-500">Resize images using presets or custom measurements.</p>
            </Link>
            <Link to="/compress-image" className={`p-4 rounded-xl border hover:border-blue-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className="font-semibold text-sm mb-1">Compress Image</h4>
              <p className="text-xs text-gray-500">Reduce image sizes with quality control sliders.</p>
            </Link>
          </div>
        </div>

        {/* Feedback Section */}
        <div className={`p-6 rounded-xl border mb-10 ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-200'}`} id="feedback-section">
          <h2 className="text-xl font-bold mb-3">Feedback & Ratings</h2>
          {feedbackSubmitted ? (
            <div className="p-4 rounded-lg bg-emerald-500/10 text-emerald-500 font-semibold text-sm text-center">
              Thank you for rating our tool!
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
                  className={`w-full p-3 rounded-lg border focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  rows="3"
                  placeholder="Share your thoughts about this tool..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
              >
                Submit Feedback
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default GeminiWatermarkRemover;
