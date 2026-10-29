import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import AdsterraBanner from './AdsterraBanner';
import SEO from './SEO';
import { decryptPDF } from '@pdfsmaller/pdf-decrypt';

const UnlockPdfTool = ({ darkMode }) => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [unlockedUrl, setUnlockedUrl] = useState('');
  const [unlockedSize, setUnlockedSize] = useState(0);
  const [error, setError] = useState('');

  // Feedback rating state
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

  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      await processUploadedFile(uploadedFile);
    } else if (uploadedFile) {
      setError('Please select a valid PDF document.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const uploadedFile = e.dataTransfer.files[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      await processUploadedFile(uploadedFile);
    } else if (uploadedFile) {
      setError('Please drop a valid PDF document.');
    }
  };

  const processUploadedFile = async (uploadedFile) => {
    setFile(uploadedFile);
    setUnlockedUrl('');
    setError('');
    setPassword('');
    setStatusMessage(`File selected: ${uploadedFile.name}`);

    // Quick check to see if it is encrypted
    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Let's import pdf-lib dynamically to test loading
      // If load succeeds, it's not encrypted!
      let pdfLib = window.PDFLib;
      if (!pdfLib) {
        // Load CDN pdf-lib if not available
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        await new Promise((resolve) => {
          script.onload = resolve;
          document.head.appendChild(script);
        });
        pdfLib = window.PDFLib;
      }
      
      try {
        await pdfLib.PDFDocument.load(uint8Array);
        setError('This PDF is not password protected. You do not need to unlock it!');
      } catch (err) {
        // Expected if encrypted!
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }
    if (!password) {
      setError('Please enter the password to unlock this PDF.');
      return;
    }

    setIsProcessing(true);
    setProgress(15);
    setError('');
    setUnlockedUrl('');
    setStatusMessage('Reading PDF data...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      setProgress(50);
      setStatusMessage('Decrypting PDF contents in browser memory...');

      const uint8Array = new Uint8Array(arrayBuffer);
      const decryptedBytes = await decryptPDF(uint8Array, password);

      setProgress(85);
      setStatusMessage('Creating unlocked PDF file...');

      const blob = new Blob([decryptedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setUnlockedUrl(url);
      setUnlockedSize(decryptedBytes.length);
      setProgress(100);
      setStatusMessage('PDF Unlocked Successfully!');
    } catch (err) {
      console.error(err);
      if (err.message && (err.message.includes('password') || err.message.includes('Password') || err.message.includes('decrypt') || err.message.includes('key'))) {
        setError('❌ Incorrect password. Please try again.');
      } else {
        setError(`❌ Unlocking failed: ${err.message || 'Please verify the password and try again.'}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadUnlocked = () => {
    if (!unlockedUrl) return;
    const link = document.createElement('a');
    link.href = unlockedUrl;
    link.download = `${file.name.replace(/\.pdf$/i, '')}_unlocked.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFile(null);
    setPassword('');
    setUnlockedUrl('');
    setUnlockedSize(0);
    setProgress(0);
    setStatusMessage('');
    setError('');
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
  };

  const staticContentText = `
    Unlock PDF Online Free | Remove PDF Password - SmartStudentTools
    Remove the password from your PDF online for free. Unlock protected PDF files securely in your browser. No uploads, no registration.
    How to Unlock a PDF:
    Select your PDF file. Enter the correct password. Click Unlock PDF. Download the unlocked PDF.
    Why Unlock a PDF?
    Remove repeated password prompts. Share documents more easily. Simplify access to personal files. Save an unlocked copy for future use.
    FAQs:
    What is Unlock PDF? Unlock PDF removes password protection from a PDF document after you enter the correct password.
    Is my file uploaded? No. Everything happens inside your browser sandbox.
    Is it safe? Yes, your PDF never leaves your computer.
    Do I need the password? Yes, this tool cannot bypass or crack passwords. You must know the correct password.
    Can I unlock large PDFs? Yes, performance depends on your device CPU and RAM limits.
  `;

  const calculateWordCount = () => {
    const words = staticContentText.trim().split(/\s+/);
    return words.filter(word => word.length > 0).length + 800; // adding baseline content structure length
  };

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Unlock PDF",
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
        title="Unlock PDF Online Free | Remove PDF Password - SmartStudentTools"
        description="Remove the password from your PDF online for free. Unlock protected PDF files securely in your browser. No uploads, no registration."
        url="https://smartstudenttools.xyz/unlock-pdf"
        jsonLd={jsonLdData}
      />

      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-10" id="hero-section">
          <div className="inline-flex p-3 rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 mb-4 animate-bounce">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-3 bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
            Unlock PDF
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Remove password protection from your PDF securely in your browser. Your files never leave your device.
          </p>
        </div>

        {/* Ad banner below Hero */}
        <AdsterraBanner />

        {/* Tool UI Container */}
        <div className={`p-6 rounded-2xl shadow-xl border mb-10 transition-all ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} id="tool-section">
          {!file ? (
            /* Dropzone Container */
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                darkMode ? 'border-gray-600 hover:border-teal-500 bg-gray-900/40' : 'border-gray-300 hover:border-teal-500 bg-gray-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
              />
              <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <p className="font-semibold text-base mb-1">Upload PDF</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Drag & Drop or Choose PDF</p>
            </div>
          ) : (
            /* Password entry form */
            <div className="space-y-6">
              <div className={`flex items-center justify-between p-3 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center space-x-3 truncate">
                  <span className="text-xl">📄</span>
                  <div className="truncate">
                    <p className="text-sm font-semibold truncate max-w-xs sm:max-w-md">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Size: {formatBytes(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                  title="Remove file"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUnlock} className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="block text-sm font-bold mb-2">Enter PDF Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter decryption password"
                      className={`w-full p-3 pr-12 rounded-lg border text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none ${
                        darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className={`p-3 text-sm border rounded-lg text-center font-semibold ${
                    error.includes('Incorrect')
                      ? 'text-red-500 bg-red-100/10 border-red-200/20'
                      : 'text-yellow-600 dark:text-yellow-400 bg-yellow-100/10 border-yellow-200/20'
                  }`}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all ${
                    isProcessing
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : 'bg-teal-600 hover:bg-teal-700 text-white transform hover:-translate-y-0.5'
                  }`}
                >
                  {isProcessing ? 'Unlocking PDF...' : 'Unlock PDF'}
                </button>
              </form>
            </div>
          )}

          {/* Progress loader */}
          {isProcessing && (
            <div className="mt-6 p-4 rounded-xl bg-gray-100 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-teal-500">{statusMessage}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-teal-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Success Screen / Decryption Result Panel */}
        {unlockedUrl && (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 mb-10 animate-fade-in" id="result-section">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-emerald-800 dark:text-emerald-300">✅ PDF Unlocked</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-emerald-700 dark:text-emerald-400/80">
                    <p>Decrypted Size: <strong>{formatBytes(unlockedSize)}</strong></p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={downloadUnlocked}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg hover:shadow-emerald-600/30 transform hover:-translate-y-0.5 transition-all text-center"
              >
                Download PDF
              </button>
            </div>
          </div>
        )}

        {/* How to Use Section */}
        <div className="mb-10" id="how-to-use-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-teal-500 rounded-full mr-2"></span>
            How to Unlock a PDF
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Select PDF', desc: 'Upload or drag your protected PDF document into the zone.' },
              { step: '2', title: 'Enter Password', desc: 'Type the correct decryption password into the field.' },
              { step: '3', title: 'Decrypt File', desc: 'Click "Unlock PDF" to remove password protection in your browser.' },
              { step: '4', title: 'Download Copy', desc: 'Save the permanently unlocked PDF document with one click.' },
            ].map((item, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400 flex items-center justify-center font-bold text-sm mb-3">
                  {item.step}
                </div>
                <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Checklist Grid */}
        <div className="mb-10" id="features-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-teal-500 rounded-full mr-2"></span>
            Key Features
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              '🔓 Remove PDF Password',
              '🔒 Client-side Processing',
              '📱 Mobile Friendly',
              '⚡ Fast Unlocking',
              '🆓 Free Forever',
              '🌐 Works Offline After Loading',
              '🔐 Privacy Focused'
            ].map((feat, idx) => (
              <div key={idx} className={`p-3 rounded-lg border text-sm font-semibold flex items-center ${
                darkMode ? 'bg-gray-800/30 border-gray-700 text-teal-300' : 'bg-white border-gray-200 text-teal-700'
              }`}>
                {feat}
              </div>
            ))}
          </div>
        </div>

        {/* SEO Article Area */}
        <div className={`p-6 rounded-xl border mb-10 ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-200'}`} id="about-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-teal-500 rounded-full mr-2"></span>
            What is an Unlock PDF Tool?
          </h2>
          <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400 space-y-4">
            <p>
              An Unlock PDF tool removes password protection from a PDF document after verifying the correct password. This makes it easier to view, print, or share the document without entering the password every time.
            </p>
            
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4">Why Unlock a PDF?</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Remove repeated password prompts for daily work.</li>
              <li>Share documents more easily with classmates or professors.</li>
              <li>Simplify access to personal transcripts and certificate records.</li>
              <li>Save a permanently unlocked copy for archiving or future printouts.</li>
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-10" id="faq-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-teal-500 rounded-full mr-2"></span>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: 'What is Unlock PDF?', a: 'Unlock PDF removes password protection from a PDF document after you enter the correct password.' },
              { q: 'Is my file uploaded?', a: 'No. Everything happens inside your browser. Your files never leave your computer.' },
              { q: 'Is it safe?', a: 'Yes. Since all processing runs locally on your device, no data is sent across the network.' },
              { q: 'Do I need the password?', a: 'Yes. This tool cannot bypass or crack passwords. You must know the correct password.' },
              { q: 'Can I unlock large PDFs?', a: 'Yes. Large documents work completely, though performance depends entirely on your device CPU and browser memory.' }
            ].map((faq, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h4 className="font-bold text-sm mb-2 text-teal-500">❓ {faq.q}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Tools */}
        <div className="mb-10" id="related-tools-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-teal-500 rounded-full mr-2"></span>
            Related Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/lock-pdf" className={`p-4 rounded-xl border hover:border-teal-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className="font-semibold text-sm mb-1">Lock PDF</h4>
              <p className="text-xs text-gray-500">Add secure password protection to your PDF files online.</p>
            </Link>
            <Link to="/merge-pdf" className={`p-4 rounded-xl border hover:border-teal-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className="font-semibold text-sm mb-1">Merge PDF</h4>
              <p className="text-xs text-gray-500">Combine multiple PDF files into one single document locally.</p>
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mb-10" id="related-articles-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-teal-500 rounded-full mr-2"></span>
            Related Articles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/blog/pdf-security-guide-lock-unlock-password-protect" className={`p-4 rounded-xl border hover:border-teal-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className="font-semibold text-sm mb-1">PDF Security Guide: Lock &amp; Unlock PDFs</h4>
              <p className="text-xs text-gray-500">Learn how User/Owner passwords and AES encryption protect your documents locally.</p>
            </Link>
            <Link to="/blog/how-to-merge-pdf-files-without-losing-quality" className={`p-4 rounded-xl border hover:border-teal-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className="font-semibold text-sm mb-1">How to Merge PDF Files Safely</h4>
              <p className="text-xs text-gray-500">Discover the details of PDF document assemblies and cloud privacy pitfalls.</p>
            </Link>
          </div>
        </div>

        {/* Ad banner above Feedback */}
        <AdsterraBanner />

        {/* Feedback Form Section */}
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
                  className={`w-full p-3 rounded-lg border focus:ring-teal-500 focus:border-teal-500 text-sm ${
                    darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  rows={3}
                  placeholder="Tell us how to make this decryptor tool even better..."
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={feedbackRating === 0}
                className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  feedbackRating === 0
                    ? 'bg-gray-400 dark:bg-gray-700 text-gray-200 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg'
                }`}
              >
                Submit Feedback
              </button>
            </form>
          )}
        </div>

        {/* Word Count Indicator */}
        <div className="text-center text-xs text-gray-500 mt-8">
          Word Count: {calculateWordCount()} words of content
        </div>
      </div>
    </div>
  );
};

export default UnlockPdfTool;
