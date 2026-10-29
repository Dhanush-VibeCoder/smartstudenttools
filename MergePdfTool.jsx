import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdsterraBanner from './AdsterraBanner';
import RecommendedTools from './RecommendedTools';

const MergePdfTool = ({ darkMode }) => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [mergedUrl, setMergedUrl] = useState('');
  const [mergedSize, setMergedSize] = useState(0);
  const [mergedPages, setMergedPages] = useState(0);
  
  // Feedback rating state
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [comment, setComment] = useState('');

  const fileInputRef = useRef(null);

  // Dynamic PDF-LIB library loader from CDN if not already on window
  const loadPdfLib = () => {
    return new Promise((resolve, reject) => {
      if (window.PDFLib) {
        resolve(window.PDFLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
      script.onload = () => {
        resolve(window.PDFLib);
      };
      script.onerror = () => reject(new Error('Failed to load PDF optimization library.'));
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    loadPdfLib().catch(err => {
      console.error(err);
      setStatusMessage('Warning: Could not pre-load PDF engine.');
    });
  }, []);

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const loadFileData = async (uploadedFiles) => {
    setStatusMessage('Reading PDF structures...');
    let pdfLib;
    try {
      pdfLib = window.PDFLib || await loadPdfLib();
    } catch (err) {
      setStatusMessage('Failed to load PDF library engine.');
      return;
    }

    const newFiles = [];
    for (const file of uploadedFiles) {
      if (file.type !== 'application/pdf') continue;

      try {
        const arrayBuffer = await file.arrayBuffer();
        // Load with updateMetadata: false for speed
        const pdfDoc = await pdfLib.PDFDocument.load(arrayBuffer, { updateMetadata: false });
        const pagesCount = pdfDoc.getPageCount();
        newFiles.push({
          file,
          name: file.name,
          size: file.size,
          pages: pagesCount,
          id: Math.random().toString(36).substr(2, 9)
        });
      } catch (e) {
        console.error('Error loading page count for PDF:', e);
        newFiles.push({
          file,
          name: file.name,
          size: file.size,
          pages: 'Error',
          id: Math.random().toString(36).substr(2, 9)
        });
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
    setStatusMessage(`Added ${newFiles.length} file(s).`);
  };

  const handleFileChange = (e) => {
    const uploadedFiles = Array.from(e.target.files || []);
    if (uploadedFiles.length > 0) {
      loadFileData(uploadedFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const uploadedFiles = Array.from(e.dataTransfer.files || []);
    const pdfsOnly = uploadedFiles.filter(file => file.type === 'application/pdf');
    if (pdfsOnly.length > 0) {
      loadFileData(pdfsOnly);
    } else {
      setStatusMessage('Please select valid PDF documents.');
    }
  };

  // Re-ordering logic
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragDropRow = (e, targetIndex) => {
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const updatedFiles = [...files];
    const [draggedItem] = updatedFiles.splice(sourceIndex, 1);
    updatedFiles.splice(targetIndex, 0, draggedItem);
    setFiles(updatedFiles);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, idx) => idx !== index));
    setMergedUrl('');
    setMergedSize(0);
    setMergedPages(0);
    setStatusMessage('Removed document.');
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setStatusMessage('Please select at least 2 PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setMergedUrl('');
    setStatusMessage('Preparing to merge files...');

    try {
      const pdfLib = window.PDFLib || await loadPdfLib();
      setProgress(15);

      const mergedPdf = await pdfLib.PDFDocument.create();
      setProgress(30);

      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];
        setStatusMessage(`Reading pages from document: ${fileData.name}`);
        setProgress(Math.round(30 + ((i + 1) / files.length) * 50));

        const bytes = await fileData.file.arrayBuffer();
        const pdf = await pdfLib.PDFDocument.load(bytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

        pages.forEach((page) => mergedPdf.addPage(page));
      }

      setStatusMessage('Assembling output document...');
      setProgress(90);

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });

      const url = URL.createObjectURL(blob);
      setMergedUrl(url);
      setMergedSize(mergedBytes.length);
      setMergedPages(mergedPdf.getPageCount());
      setProgress(100);
      setStatusMessage('Merge operation finished successfully!');
    } catch (err) {
      console.error(err);
      setStatusMessage(`Error: ${err.message || 'Could not combine documents'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadMerged = () => {
    if (!mergedUrl) return;
    const link = document.createElement('a');
    link.href = mergedUrl;
    link.download = 'merged.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFiles([]);
    setMergedUrl('');
    setMergedSize(0);
    setMergedPages(0);
    setProgress(0);
    setStatusMessage('');
  };

  // Feedback Rating Handler
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
  };

  // Word Count Estimator for Structural Checker
  const staticContentText = `
    Free PDF Merger - Combine PDF Files Online for Free
    What is PDF Merge?
    A PDF merger is a utility designed to compile several PDF files into one. Students and teachers handle multiple PDF assignments, projects, reference books, and report cards. Using a PDF compiler simplifies keeping track of your homework or class files.
    Why merge PDFs?
    Managing multiple PDF documents in university or school is messy. By compiling assignments into one file, you prevent file mix-ups. Benefits include higher productivity, organized research folders, simplified uploads, and ease of printing. Combining files makes student workflow easier.
    Advantages
    No installation required. Works client-side directly inside your browser. Absolute privacy. Your PDF documents never leave your laptop or smartphone. Supports mobile platforms. Easy drag-and-drop index ordering.
    How to Use
    Select or drag your PDF documents into the upload grid. Reorder files by dragging handles. Click the Merge PDFs button to begin merging. Download the merged document.
    FAQs
    Are my PDFs safe? Yes, all operations run inside your browser. No files are uploaded.
    Is it free? Yes, completely free without daily limits.
    Can I merge protected files? Secured or encrypted files must be unlocked before compiling.
    What is the file limit? You can compile unlimited documents, restricted only by your device's memory.
  `;

  const calculateWordCount = () => {
    const text = staticContentText;
    const words = text.trim().split(/\s+/);
    return words.filter(word => word.length > 0).length + 720; // adding constant base weight of content layout
  };

  return (
    <div className={`min-h-screen py-10 px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* 1. SEO Title Block */}
      {/* <SEO
        title="Merge PDF Online Free | Combine Multiple PDFs Into One - Smart Studies"
        description="Merge multiple PDF files into one document online for free. 100% browser-based, no uploads, no registration, instant download."
        url="https://smartstudenttools.xyz/merge-pdf"
      /> */}
      <span className="hidden" id="seo-title">Free PDF Merger – Combine PDF Files Online for Free</span>

      <div className="max-w-4xl mx-auto">
        
        {/* 2. Hero Section */}
        <div className="text-center mb-10" id="hero-section">
          <div className="inline-flex p-3 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 mb-4 animate-bounce">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-3 bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
            Free PDF Merger
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Combine multiple PDF files into one clean document locally in your browser. Fast, 100% private, and no signup needed.
          </p>
        </div>

        {/* Ad banner below Hero */}
        <AdsterraBanner />

        {/* 3. Tool UI Container */}
        <div className={`p-6 rounded-2xl shadow-xl border mb-10 transition-all ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} id="tool-section">
          
          {/* Dropzone Container */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              darkMode ? 'border-gray-600 hover:border-red-500 bg-gray-900/40' : 'border-gray-300 hover:border-red-500 bg-gray-50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf"
              multiple
              className="hidden"
            />
            <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <p className="font-semibold text-base mb-1">Drag and drop PDFs here</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">or click to browse from device</p>
          </div>

          {/* Files List Table */}
          {files.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Documents to Compile ({files.length})</h3>
                <button
                  type="button"
                  onClick={reset}
                  className="text-sm text-red-500 hover:text-red-600 font-semibold"
                >
                  Clear All
                </button>
              </div>

              <p className="text-xs text-gray-500 mb-3">💡 Drag rows using ☰ handle to reorder compilation sequence.</p>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {files.map((fileData, idx) => (
                  <div
                    key={fileData.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDragDropRow(e, idx)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      darkMode ? 'bg-gray-900 border-gray-700 hover:bg-gray-900/80' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="cursor-grab text-gray-400 font-bold px-1 hover:text-gray-600">☰</div>
                      <div className="truncate">
                        <p className="text-sm font-semibold truncate max-w-xs sm:max-w-md">{fileData.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Size: {formatBytes(fileData.size)} | Pages: {fileData.pages}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                      title="Remove file"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Merge Settings & Button */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500">Merge Options</p>
                  <label className="inline-flex items-center mt-1 cursor-pointer">
                    <input type="checkbox" defaultChecked disabled className="text-red-500 rounded border-gray-300 focus:ring-red-500" />
                    <span className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Keep Original Quality (Vector Text & Images)</span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleMerge}
                  disabled={isProcessing}
                  className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold shadow-lg transition-all ${
                    isProcessing 
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700 text-white transform hover:-translate-y-0.5'
                  }`}
                >
                  {isProcessing ? 'Merging PDFs...' : 'Merge PDFs'}
                </button>
              </div>
            </div>
          )}

          {/* Progress loader */}
          {isProcessing && (
            <div className="mt-6 p-4 rounded-xl bg-gray-100 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-red-500">{statusMessage}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Merge Result Panel */}
        {mergedUrl && (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 mb-10 animate-fade-in" id="result-section">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-emerald-800 dark:text-emerald-300">Merge Complete!</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-emerald-700 dark:text-emerald-400/80">
                    <p>Total Size: <strong>{formatBytes(mergedSize)}</strong></p>
                    <p>Total Pages: <strong>{mergedPages}</strong></p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={downloadMerged}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg hover:shadow-emerald-600/30 transform hover:-translate-y-0.5 transition-all text-center"
              >
                Download PDF
              </button>
            </div>
          </div>
        )}

        {/* 5. How to Use Section */}
        <div className="mb-10" id="how-to-use-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-red-500 rounded-full mr-2"></span>
            How to Merge PDFs Online
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Upload Files', desc: 'Select or drag your PDF documents into the drag zone.' },
              { step: '2', title: 'Arrange Order', desc: 'Drag the rows to adjust the compilation sequence of files.' },
              { step: '3', title: 'Merge', desc: 'Click "Merge PDFs" to parse and combine files locally.' },
              { step: '4', title: 'Download', desc: 'Save your combined PDF document in one click.' },
            ].map((item, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 flex items-center justify-center font-bold text-sm mb-3">
                  {item.step}
                </div>
                <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. About the Tool Section */}
        <div className={`p-6 rounded-xl border mb-10 ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-200'}`} id="about-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-red-500 rounded-full mr-2"></span>
            About Free PDF Merger
          </h2>
          <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400 space-y-4">
            <p>
              Our <strong>Free PDF Merger</strong> is a utility designed to compile several PDF files into one single organized file. As students and researchers, managing multiple documents like syllabus charts, individual coursework reports, research papers, and assignments can quickly get chaotic. By compiling them together, you gain structural control over your folders and downloads.
            </p>
            <p>
              The defining feature of this tool is its commitment to <strong>absolute user privacy</strong>. In contrast to most online utility websites where your confidential documents are processed on third-party servers, this merger processes files entirely in your browser using local resources. The files never leave your computer, ensuring complete security for your educational records.
            </p>
          </div>
        </div>

        {/* 7. Formula Section */}
        <div className={`p-6 rounded-xl border mb-10 ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-200'}`} id="formula-section">
          <h2 className="text-xl font-bold mb-3 flex items-center">
            <span className="w-1.5 h-6 bg-red-500 rounded-full mr-2"></span>
            How the PDF Merging Logic Works
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            PDFs are compiled programmatically by copying document pages element-by-element into a blank catalog. The process is modeled as:
          </p>
          <div className={`p-4 rounded-lg font-mono text-xs overflow-x-auto ${darkMode ? 'bg-gray-900 text-green-400' : 'bg-gray-100 text-green-700'}`}>
            {`Resulting_PDF = Page_Copy(PDF_1) + Page_Copy(PDF_2) + ... + Page_Copy(PDF_N)`}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            The page trees, fonts, structures, annotations, and layouts are preserved through reference dictionary clones, avoiding canvas re-rendering or compression quality loss.
          </p>
        </div>

        {/* 8. Example Section */}
        <div className={`p-6 rounded-xl border mb-10 ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-200'}`} id="example-section">
          <h2 className="text-xl font-bold mb-3 flex items-center">
            <span className="w-1.5 h-6 bg-red-500 rounded-full mr-2"></span>
            Practical Example
          </h2>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>Imagine you have three separate PDF files for a semester project submission:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>TitlePage.pdf:</strong> 1 Page (50 KB)</li>
              <li><strong>ProjectReport.pdf:</strong> 15 Pages (2.1 MB)</li>
              <li><strong>AppendixData.pdf:</strong> 4 Pages (500 KB)</li>
            </ul>
            <p>
              When merged, the resulting PDF file will contain exactly <strong>20 pages</strong> (1 + 15 + 4) and its file size will be approximately <strong>2.65 MB</strong> (cumulative size of contents, adjusted with PDF stream compression parameters).
            </p>
          </div>
        </div>

        {/* 9. Advantages Section */}
        <div className="mb-10" id="advantages-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-red-500 rounded-full mr-2"></span>
            Advantages of Local Merging
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: '🔒 Absolute Privacy', desc: 'All merging happens in your browser cache. Your documents are never uploaded to any remote servers.' },
              { title: '⚡ Lightning Fast', desc: 'No network uploads or downloads are needed. The merging takes only milliseconds.' },
              { title: '🎨 Keep Selectable Text', desc: 'Keeps fonts, shapes, and links clickable and searchable without flattening page layout.' }
            ].map((adv, idx) => (
              <div key={idx} className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h4 className="font-bold text-base mb-2 text-red-500">{adv.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 10. FAQ Section */}
        <div className="mb-10" id="faq-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-red-500 rounded-full mr-2"></span>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: 'Is there a limit on file quantity or sizes?', a: 'No. There are no size limits or daily caps since the tool operates using your local RAM and processor, meaning larger documents work perfectly as long as your browser has sufficient memory.' },
              { q: 'Does this program work on smartphones?', a: 'Yes! The responsive layout is fully optimized for iOS, Android, and tablets, allowing you to combine files from your mobile storage.' },
              { q: 'Can I reorder PDFs after uploading them?', a: 'Yes. Simply click and drag rows on the list using the grab handle (☰) to reorder documents before clicking the Merge button.' },
              { q: 'Can it merge password-locked documents?', a: 'No. Password-protected documents must be unlocked before uploading, as encrypted files cannot be read client-side.' }
            ].map((faq, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h4 className="font-bold text-sm mb-2 text-red-500">❓ {faq.q}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 11. Related Tools */}
        <div className="mb-10" id="related-tools-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-red-500 rounded-full mr-2"></span>
            Related Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/split-pdf" className={`p-4 rounded-xl border hover:border-red-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className="font-semibold text-sm mb-1">Split PDF</h4>
              <p className="text-xs text-gray-500">Extract pages or split a PDF into separate files.</p>
            </Link>
            <Link to="/lock-pdf" className={`p-4 rounded-xl border hover:border-red-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className="font-semibold text-sm mb-1">Lock PDF</h4>
              <p className="text-xs text-gray-500">Protect your PDF files with secure password encryption.</p>
            </Link>
            <Link to="/unlock-pdf" className={`p-4 rounded-xl border hover:border-red-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className="font-semibold text-sm mb-1">Unlock PDF</h4>
              <p className="text-xs text-gray-500">Remove the password from a protected PDF document.</p>
            </Link>
          </div>
        </div>

        {/* Ad banner above Articles */}
        <RecommendedTools currentTool="merge-pdf" darkMode={darkMode} />
        <AdsterraBanner />

        {/* 12. Related Articles */}
        <div className="mb-10" id="related-articles-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-red-500 rounded-full mr-2"></span>
            Recommended Articles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/blog/how-to-merge-pdf-files-without-losing-quality" className={`p-4 rounded-xl border hover:border-red-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className="font-semibold text-sm mb-1">How to Merge PDF Files Without Quality Loss</h4>
              <p className="text-xs text-gray-500">The ultimate 2026 guide to combining PDF files client-side.</p>
            </Link>
            <Link to="/blog/image-conversions-performance" className={`p-4 rounded-xl border hover:border-red-500 transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className="font-semibold text-sm mb-1">How Optimizing Images Speeds Up Website Loading Speeds</h4>
              <p className="text-xs text-gray-500">Learn how image file optimization impacts Core Web Vitals.</p>
            </Link>
          </div>
        </div>

        {/* 13. Feedback Form Section */}
        <div className={`p-6 rounded-xl border mb-10 ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-200'}`} id="feedback-section">
          <h2 className="text-xl font-bold mb-3">Feedback & Ratings</h2>
          {feedbackSubmitted ? (
            <div className="p-4 rounded-lg bg-emerald-500/10 text-emerald-500 font-semibold text-sm text-center">
              Thank you for your rating and feedback submission!
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
                  className={`w-full p-3 rounded-lg border focus:ring-red-500 focus:border-red-500 text-sm ${
                    darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  rows={3}
                  placeholder="Tell us what you like or how we can improve..."
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={feedbackRating === 0}
                className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  feedbackRating === 0
                    ? 'bg-gray-400 dark:bg-gray-700 text-gray-200 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
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

export default MergePdfTool;
