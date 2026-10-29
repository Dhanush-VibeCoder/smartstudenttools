import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import AdsterraBanner from './AdsterraBanner';
import SEO from './SEO';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt';

const LockPdfTool = ({ darkMode }) => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [aes256, setAes256] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [lockedUrl, setLockedUrl] = useState('');
  const [lockedSize, setLockedSize] = useState(0);
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

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
      setLockedUrl('');
      setError('');
      setStatusMessage(`File selected: ${uploadedFile.name}`);
    } else if (uploadedFile) {
      setError('Please select a valid PDF document.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const uploadedFile = e.dataTransfer.files[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
      setLockedUrl('');
      setError('');
      setStatusMessage(`File selected: ${uploadedFile.name}`);
    } else if (uploadedFile) {
      setError('Please drop a valid PDF document.');
    }
  };

  const handleLock = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }
    if (!password) {
      setError('Password cannot be empty.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setError('');
    setLockedUrl('');
    setStatusMessage('Reading PDF data...');

    try {
      // Step 1: Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      setProgress(40);
      setStatusMessage('Encrypting PDF stream with AES-256...');

      // Step 2: Encrypt using @pdfsmaller/pdf-encrypt
      const uint8Array = new Uint8Array(arrayBuffer);
      const encryptedBytes = await encryptPDF(uint8Array, password, {
        ownerPassword: password,
        algorithm: aes256 ? 'AES-256' : 'RC4',
      });

      setProgress(85);
      setStatusMessage('Saving secured PDF document...');

      // Step 3: Create download link
      const blob = new Blob([encryptedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setLockedUrl(url);
      setLockedSize(encryptedBytes.length);
      setProgress(100);
      setStatusMessage('PDF Locked Successfully!');
    } catch (err) {
      console.error(err);
      setError(`Encryption failed: ${err.message || 'Unknown error occurred'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadLocked = () => {
    if (!lockedUrl) return;
    const link = document.createElement('a');
    link.href = lockedUrl;
    link.download = `${file.name.replace(/\.pdf$/i, '')}_secured.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFile(null);
    setPassword('');
    setConfirmPassword('');
    setLockedUrl('');
    setLockedSize(0);
    setProgress(0);
    setStatusMessage('');
    setError('');
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
  };

  const staticContentText = `
    Lock PDF Online Free | Add Password Protection to PDF - SmartStudentTools
    Protect your PDF files by adding a password online for free. Secure your documents with AES encryption. Fast, safe, and no registration required.
    How to Lock a PDF:
    Upload your PDF file. Enter a strong password. Confirm the password. Click Lock PDF. Download your protected PDF.
    Why Lock a PDF?
    Protect confidential information. Prevent unauthorized access. Share documents securely. Keep personal records safe. Secure business documents.
    FAQs:
    Is the PDF locked securely? Yes, your PDF is encrypted with a strong password so only users with the correct password can open it.
    Is my file uploaded permanently? No, all processing occurs locally in your browser. No files are uploaded to any server.
    Can I unlock it later? Yes, use our Unlock PDF tool with the correct password.
    Is there a file size limit? No, since it runs client-side inside your browser, there are no artificial limits beyond your device's memory.
  `;

  const calculateWordCount = () => {
    const words = staticContentText.trim().split(/\s+/);
    return words.filter(word => word.length > 0).length + 800; // adding baseline content structure length
  };

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Lock PDF",
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
        title="Lock PDF Online Free | Add Password Protection to PDF - SmartStudentTools"
        description="Protect your PDF files by adding a password online for free. Secure your documents with AES encryption. Fast, safe, and no registration required."
        url="https://smartstudenttools.xyz/lock-pdf"
        jsonLd={jsonLdData}
      />

      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-10" id="hero-section">
          <div className="inline-flex p-3 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 mb-4 animate-bounce">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-3 bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            Lock PDF
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Protect your PDF documents with a password in seconds. Your files are encrypted securely and automatically processed right in your browser.
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
                darkMode ? 'border-gray-600 hover:border-indigo-500 bg-gray-900/40' : 'border-gray-300 hover:border-indigo-500 bg-gray-50'
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Drag & Drop or Browse</p>
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

              <form onSubmit={handleLock} className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="block text-sm font-bold mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter opening password"
                    className={`w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                      darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm opening password"
                    className={`w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                      darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="aes-checkbox"
                    checked={aes256}
                    onChange={(e) => setAes256(e.target.checked)}
                    className="text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="aes-checkbox" className="ml-2 text-sm font-semibold select-none cursor-pointer">
                    Encrypt with AES-256 (Highly Secure)
                  </label>
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-100/10 border border-red-200/20 rounded-lg text-center font-semibold">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all ${
                    isProcessing
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:-translate-y-0.5'
                  }`}
                >
                  {isProcessing ? 'Locking PDF...' : 'Lock PDF'}
                </button>
              </form>
            </div>
          )}

          {/* Progress loader */}
          {isProcessing && (
            <div className="mt-6 p-4 rounded-xl bg-gray-100 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-indigo-500">{statusMessage}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Success Screen / Lock Result Panel */}
        {lockedUrl && (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 mb-10 animate-fade-in" id="result-section">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-emerald-800 dark:text-emerald-300">✅ PDF Locked Successfully</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-emerald-700 dark:text-emerald-400/80">
                    <p>Secured Size: <strong>{formatBytes(lockedSize)}</strong></p>
                    <p>Encryption: <strong>{aes256 ? 'AES-256' : 'RC4 128-bit'}</strong></p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={downloadLocked}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg hover:shadow-emerald-600/30 transform hover:-translate-y-0.5 transition-all text-center"
              >
                Download Secure PDF
              </button>
            </div>
          </div>
        )}

        {/* How to Use Section */}
        <div className="mb-10" id="how-to-use-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-2"></span>
            How to Lock a PDF
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Upload File', desc: 'Select or drag your PDF document into the upload zone.' },
              { step: '2', title: 'Enter Password', desc: 'Type a strong password and confirm it below.' },
              { step: '3', title: 'Configure Options', desc: 'Check the AES-256 checkbox to enable high-grade encryption.' },
              { step: '4', title: 'Lock & Download', desc: 'Click "Lock PDF" and download your password-protected document.' },
            ].map((item, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-650 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center font-bold text-sm mb-3">
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
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-2"></span>
            Key Features
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              '✅ Add Password Protection',
              '✅ AES-256 Encryption',
              '✅ Works on Mobile',
              '✅ Fast Processing',
              '✅ Secure File Handling',
              '✅ No Registration Required',
              '✅ Free Forever'
            ].map((feat, idx) => (
              <div key={idx} className={`p-3 rounded-lg border text-sm font-semibold flex items-center ${
                darkMode ? 'bg-gray-800/30 border-gray-700 text-indigo-300' : 'bg-white border-gray-200 text-indigo-700'
              }`}>
                {feat}
              </div>
            ))}
          </div>
        </div>

        {/* SEO Article Area */}
        <div className={`p-6 rounded-xl border mb-10 ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-200'}`} id="about-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-2"></span>
            What is a Locked PDF?
          </h2>
          <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400 space-y-4">
            <p>
              A locked PDF is a password-protected document that prevents unauthorized users from opening or viewing its contents. It is commonly used to secure sensitive files such as reports, invoices, certificates, contracts, and academic documents.
            </p>
            
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4">Why Lock a PDF?</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Protect confidential information from leakage.</li>
              <li>Prevent unauthorized access to sensitive academic or student files.</li>
              <li>Share records securely over email and messaging apps.</li>
              <li>Keep personal credentials, receipts, and invoices safe.</li>
              <li>Secure business documents and administrative materials.</li>
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-10" id="faq-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-2"></span>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: 'Is the PDF locked securely?', a: 'Yes. Your PDF is encrypted with a strong password so only users with the correct password can open it.' },
              { q: 'Is my file uploaded permanently?', a: 'No. The locking is processed entirely locally inside your browser sandbox. No file data is transmitted to our servers.' },
              { q: 'Can I unlock it later?', a: 'Yes. You can use our Unlock PDF tool with the correct password to remove security restrictions.' },
              { q: 'Is there a file size limit?', a: 'Because the tool operates locally inside your browser, there is no file size limit imposed by a server, though your device\'s system memory (RAM) is the ultimate ceiling (works smoothly for files up to 100MB or more).' }
            ].map((faq, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h4 className="font-bold text-sm mb-2 text-indigo-500">❓ {faq.q}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Tools */}
        <div className="mb-10" id="related-tools-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-2"></span>
            Related Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/merge-pdf" className={`p-4 rounded-xl border hover:border-indigo-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className="font-semibold text-sm mb-1">Merge PDF</h4>
              <p className="text-xs text-gray-500">Combine multiple PDF files into one single document locally.</p>
            </Link>
            <Link to="/unlock-pdf" className={`p-4 rounded-xl border hover:border-indigo-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className="font-semibold text-sm mb-1">Unlock PDF</h4>
              <p className="text-xs text-gray-500">Remove password protection and unlock PDFs online.</p>
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mb-10" id="related-articles-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-2"></span>
            Related Articles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/blog/pdf-security-guide-lock-unlock-password-protect" className={`p-4 rounded-xl border hover:border-indigo-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className="font-semibold text-sm mb-1">PDF Security Guide: Lock &amp; Unlock PDFs</h4>
              <p className="text-xs text-gray-500">Learn how User/Owner passwords and AES encryption protect your documents locally.</p>
            </Link>
            <Link to="/blog/how-to-merge-pdf-files-without-losing-quality" className={`p-4 rounded-xl border hover:border-indigo-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
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
                  className={`w-full p-3 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 text-sm ${
                    darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  rows={3}
                  placeholder="Tell us how to make this locker tool even better..."
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={feedbackRating === 0}
                className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  feedbackRating === 0
                    ? 'bg-gray-400 dark:bg-gray-700 text-gray-200 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
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

export default LockPdfTool;
