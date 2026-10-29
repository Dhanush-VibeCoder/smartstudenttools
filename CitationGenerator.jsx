import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import AdsterraBanner from './AdsterraBanner';

const CitationGenerator = ({ darkMode }) => {
  const [sourceType, setSourceType] = useState('journal'); // 'journal', 'website', 'book'
  const [format, setFormat] = useState('ieee'); // 'ieee', 'apa', 'mla', 'harvard'
  
  // Fields
  const [authors, setAuthors] = useState('');
  const [title, setTitle] = useState('');
  const [container, setContainer] = useState(''); // Journal, Website, or Publisher
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [volume, setVolume] = useState('');
  const [issue, setIssue] = useState('');
  const [pages, setPages] = useState('');
  const [url, setUrl] = useState('');
  const [doi, setDoi] = useState('');

  // Bibliography list
  const [bibliography, setBibliography] = useState([]);
  const [copied, setCopied] = useState(false);
  const [bibCopied, setBibCopied] = useState(false);

  // Rating
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Parse Authors
  const parseAuthors = (raw) => {
    if (!raw.trim()) return ['Anonymous'];
    return raw.split(',').map(a => a.trim()).filter(Boolean);
  };

  // Format generator
  const generateCitation = (fmt = format) => {
    const authorList = parseAuthors(authors);
    const cleanTitle = title.trim() || 'Untitled Document';
    const cleanContainer = container.trim() || (sourceType === 'journal' ? 'Journal Name' : sourceType === 'website' ? 'Website Name' : 'Publisher');
    const cleanYear = year.trim() || 'n.d.';
    const cleanUrl = url.trim();
    const cleanDoi = doi.trim();
    const doiOrUrl = cleanDoi ? `https://doi.org/${cleanDoi.replace(/^https?:\/\/doi\.org\//, '')}` : cleanUrl;

    if (fmt === 'ieee') {
      // IEEE format: [1] A. Author and B. Author, "Title of paper," Abbrev. Container, vol. x, no. x, pp. xxx-xxx, Year.
      const formattedAuthors = authorList.map(a => {
        const parts = a.split(' ');
        if (parts.length > 1) {
          const initials = parts.slice(0, -1).map(p => p[0].toUpperCase() + '.').join(' ');
          return `${initials} ${parts[parts.length - 1]}`;
        }
        return a;
      }).join(' and ');

      let details = [];
      if (volume) details.push(`vol. ${volume}`);
      if (issue) details.push(`no. ${issue}`);
      if (pages) details.push(`pp. ${pages}`);
      const detailStr = details.length > 0 ? `, ${details.join(', ')}` : '';
      const doiStr = doiOrUrl ? `, doi: ${cleanDoi || cleanUrl}` : '';

      if (sourceType === 'journal') {
        return `${formattedAuthors}, "${cleanTitle}," ${cleanContainer}${detailStr}, ${cleanYear}${doiStr}.`;
      } else if (sourceType === 'website') {
        return `${formattedAuthors}, "${cleanTitle}," ${cleanContainer}, ${cleanYear}. [Online]. Available: ${cleanUrl || 'URL'}. [Accessed: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}].`;
      } else {
        return `${formattedAuthors}, ${cleanTitle}, ${volume ? `vol. ${volume}, ` : ''}${cleanContainer}: ${cleanContainer}, ${cleanYear}.`;
      }
    }

    if (fmt === 'apa') {
      // APA 7: Author, A. A., & Author, B. B. (Year). Title of article. Container, volume(issue), pages. DOI/URL
      const formattedAuthors = authorList.map(a => {
        const parts = a.split(' ');
        if (parts.length > 1) {
          const initials = parts.slice(0, -1).map(p => p[0].toUpperCase() + '.').join(' ');
          return `${parts[parts.length - 1]}, ${initials}`;
        }
        return a;
      }).join(', & ');

      let volIssue = '';
      if (volume && issue) volIssue = `, ${volume}(${issue})`;
      else if (volume) volIssue = `, ${volume}`;
      const pageStr = pages ? `, ${pages}` : '';
      const linkStr = doiOrUrl ? ` ${doiOrUrl}` : '';

      return `${formattedAuthors} (${cleanYear}). ${cleanTitle}. ${cleanContainer}${volIssue}${pageStr}.${linkStr}`;
    }

    if (fmt === 'mla') {
      // MLA 9: Author. "Title." Container, vol. ..., no. ..., Year, pp. ...
      const firstAuthor = authorList[0] || 'Anonymous';
      const parts = firstAuthor.split(' ');
      const mlaFirst = parts.length > 1 ? `${parts[parts.length - 1]}, ${parts.slice(0, -1).join(' ')}` : firstAuthor;
      const others = authorList.length > 1 ? ', et al.' : '';
      const volStr = volume ? `, vol. ${volume}` : '';
      const issStr = issue ? `, no. ${issue}` : '';
      const pageStr = pages ? `, pp. ${pages}` : '';
      const linkStr = doiOrUrl ? `, ${doiOrUrl}` : '';

      return `${mlaFirst}${others} "${cleanTitle}." ${cleanContainer}${volStr}${issStr}, ${cleanYear}${pageStr}${linkStr}.`;
    }

    if (fmt === 'harvard') {
      // Harvard: Author, A. (Year) 'Title', Container, volume(issue), pp. pages.
      const formattedAuthors = authorList.map(a => {
        const parts = a.split(' ');
        if (parts.length > 1) {
          const initials = parts.slice(0, -1).map(p => p[0].toUpperCase()).join('.');
          return `${parts[parts.length - 1]}, ${initials}.`;
        }
        return a;
      }).join(' and ');

      const volIssue = volume ? `, ${volume}${issue ? `(${issue})` : ''}` : '';
      const pageStr = pages ? `, pp. ${pages}` : '';
      const linkStr = doiOrUrl ? `, available: ${doiOrUrl}` : '';

      return `${formattedAuthors} (${cleanYear}) '${cleanTitle}', ${cleanContainer}${volIssue}${pageStr}${linkStr}.`;
    }

    return '';
  };

  const currentCitation = generateCitation();

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(currentCitation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAddToBibliography = () => {
    if (!title.trim()) return;
    const item = {
      id: Date.now(),
      citation: currentCitation,
      format: format.toUpperCase(),
      sourceType
    };
    setBibliography(prev => [...prev, item]);
  };

  const handleRemoveBibItem = (id) => {
    setBibliography(prev => prev.filter(b => b.id !== id));
  };

  const handleCopyAllBib = () => {
    if (bibliography.length === 0) return;
    const text = bibliography.map((item, idx) => `[${idx + 1}] ${item.citation}`).join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      setBibCopied(true);
      setTimeout(() => setBibCopied(false), 2000);
    });
  };

  const handleShareWhatsApp = () => {
    const text = `Need to write IEEE or APA references for your college project or seminar report? Use this free Citation Generator:\nhttps://smartstudenttools.xyz/citation-generator`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className={`p-4 font-inter min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-indigo-50 to-blue-100 text-gray-800'}`}>
      <SEO
        title="IEEE & APA Citation Generator | Free Academic Reference Maker - Smart Studies"
        description="Free academic citation generator for engineering and college students. Generate instant IEEE, APA 7, MLA 9, and Harvard citations for project reports and seminars."
        url="https://smartstudenttools.xyz/citation-generator"
      />

      <div className={`p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-4xl mx-auto border space-y-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/40 rounded-2xl text-blue-600 dark:text-blue-400 mb-2">
            <span className="text-4xl">📑</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Academic Citation Generator</h1>
          <p className={`text-sm md:text-base max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Generate perfectly formatted citations for your engineering seminar reports, project dissertations, and research papers.
          </p>
        </div>

        {/* Source Type Selector */}
        <div className="flex flex-wrap justify-center gap-2 border-b pb-4 dark:border-gray-700">
          {[
            { id: 'journal', label: '📄 Journal / Conference', icon: '📄' },
            { id: 'website', label: '🌐 Website / Web Page', icon: '🌐' },
            { id: 'book', label: '📚 Book / Textbook', icon: '📚' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSourceType(tab.id)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                sourceType === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Format Selector Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Citation Style:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ieee', label: 'IEEE (Engineering)' },
              { id: 'apa', label: 'APA 7th' },
              { id: 'mla', label: 'MLA 9th' },
              { id: 'harvard', label: 'Harvard' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
                  format === f.id
                    ? 'bg-indigo-600 text-white shadow'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <div className={`p-5 rounded-xl border space-y-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">
                Author(s) (comma-separated):
              </label>
              <input
                type="text"
                placeholder="e.g. Alan Turing, Claude Shannon"
                value={authors}
                onChange={e => setAuthors(e.target.value)}
                className={`w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                  darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">
                {sourceType === 'book' ? 'Book Title:' : 'Paper / Article Title:'}
              </label>
              <input
                type="text"
                placeholder="e.g. Computing Machinery and Intelligence"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={`w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                  darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">
                {sourceType === 'journal' ? 'Journal / Conference Name:' : sourceType === 'website' ? 'Website Name:' : 'Publisher:'}
              </label>
              <input
                type="text"
                placeholder={sourceType === 'journal' ? 'e.g. IEEE Transactions on Software' : 'e.g. TechCrunch'}
                value={container}
                onChange={e => setContainer(e.target.value)}
                className={`w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                  darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">
                Year of Publication:
              </label>
              <input
                type="text"
                placeholder="e.g. 2024"
                value={year}
                onChange={e => setYear(e.target.value)}
                className={`w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                  darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">
                Pages (e.g. 102-115):
              </label>
              <input
                type="text"
                placeholder="e.g. 45-52"
                value={pages}
                onChange={e => setPages(e.target.value)}
                className={`w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                  darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>

          {sourceType === 'journal' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">
                  Volume:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 14"
                  value={volume}
                  onChange={e => setVolume(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                    darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">
                  Issue / Number:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3"
                  value={issue}
                  onChange={e => setIssue(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                    darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">
                  DOI:
                </label>
                <input
                  type="text"
                  placeholder="10.1109/5.771073"
                  value={doi}
                  onChange={e => setDoi(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                    darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>
          )}

          {sourceType === 'website' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">
                Website URL:
              </label>
              <input
                type="url"
                placeholder="https://example.com/research-article"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className={`w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                  darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          )}
        </div>

        {/* Live Preview Card */}
        <div className={`p-6 rounded-xl border space-y-3 ${darkMode ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50/70 border-blue-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Formatted {format.toUpperCase()} Reference:
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Instant Preview</span>
          </div>

          <div className={`p-4 rounded-lg font-mono text-sm leading-relaxed border ${darkMode ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-900'}`}>
            {currentCitation}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleCopyCitation}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow transition-all duration-200 transform hover:scale-105"
            >
              <span>{copied ? '✅' : '📋'}</span> {copied ? 'Copied to Clipboard!' : 'Copy Citation'}
            </button>
            <button
              onClick={handleAddToBibliography}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm shadow transition-all duration-200 transform hover:scale-105 ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              <span>➕</span> Add to Bibliography List
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm shadow transition-all duration-200"
            >
              <span>📲</span> Share Tool
            </button>
          </div>
        </div>

        {/* Bibliography List (if any items added) */}
        {bibliography.length > 0 && (
          <div className={`p-6 rounded-xl border space-y-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-lg">📚 Your References List ({bibliography.length})</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyAllBib}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition"
                >
                  {bibCopied ? '✅ Copied All!' : '📋 Copy All References'}
                </button>
                <button
                  onClick={() => setBibliography([])}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition"
                >
                  Clear List
                </button>
              </div>
            </div>

            <ol className="list-decimal list-inside space-y-3 text-sm font-mono">
              {bibliography.map((item, idx) => (
                <li key={item.id} className="p-3 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mr-2">[{idx + 1}]</span>
                    <span>{item.citation}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveBibItem(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm ml-2 font-bold"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Responsive Adsterra Unit */}
        <AdsterraBanner />

        {/* Educational Content & Guide for SEO */}
        <div className="space-y-6 pt-4 border-t dark:border-gray-700">
          <div className="space-y-2">
            <h2 className="text-xl font-bold">📘 Guide to Academic Referencing</h2>
            <p className="text-sm opacity-90 leading-relaxed">
              Proper referencing gives credit to original researchers, prevents plagiarism in college project evaluations, and demonstrates rigorous academic research. Most university departments in engineering and computer science mandate the <strong>IEEE Citation Style</strong>, whereas social sciences use <strong>APA 7th</strong> and humanities use <strong>MLA 9th</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className="font-bold text-md text-blue-600 dark:text-blue-400 mb-1">⚡ IEEE Citation Standard</h3>
              <p className="text-xs leading-relaxed opacity-90">
                IEEE references are numbered sequentially in brackets in the order they appear in text (e.g., <code>[1]</code>, <code>[2]</code>). The reference list at the end arranges sources numerically, with author initials preceding the surname.
              </p>
            </div>
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className="font-bold text-md text-indigo-600 dark:text-indigo-400 mb-1">⚡ APA 7th Edition Standard</h3>
              <p className="text-xs leading-relaxed opacity-90">
                APA uses the author-date in-text citation format (e.g., <code>(Turing, 1950)</code>). The bibliography is organized alphabetically by the first author's last name with hanging indentation.
              </p>
            </div>
          </div>

          {/* Related Tools & Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className="font-bold text-sm mb-2">🛠️ Related Academic Tools</h4>
              <ul className="text-xs space-y-1.5 text-blue-600 dark:text-blue-400">
                <li><Link to="/study-planner" className="hover:underline">Study Planner & Revision Timetable</Link></li>
                <li><Link to="/grade-calculator" className="hover:underline">College Grade Calculator</Link></li>
                <li><Link to="/gpa-converter" className="hover:underline">CGPA to Percentage Converter</Link></li>
                <li><Link to="/image-to-text" className="hover:underline">Image to Text (OCR) Notes Extractor</Link></li>
              </ul>
            </div>
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className="font-bold text-sm mb-2">📚 Related Articles</h4>
              <ul className="text-xs space-y-1.5 text-blue-600 dark:text-blue-400">
                <li>
                  <Link to="/blog/how-to-write-ieee-apa-citations-engineering-projects" className="hover:underline">
                    How to Write IEEE and APA References for Engineering Projects & Seminars
                  </Link>
                </li>
                <li>
                  <Link to="/blog/academic-survival-guide-calculate-grades-predict-scores-clear-backlogs" className="hover:underline">
                    The Academic Survival Guide: How to Calculate Grades & Plan Semesters
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Rating Section */}
          <div className="p-5 rounded-xl border text-center space-y-2 dark:border-gray-700">
            <h4 className="font-bold text-sm">Rate this tool</h4>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => { setRating(star); setRatingSubmitted(true); }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={`text-2xl transition-colors ${
                    star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            {ratingSubmitted && (
              <p className="text-xs text-green-600 font-semibold">Thank you for rating {rating} stars!</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CitationGenerator;
