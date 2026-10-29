import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogArticles } from './blogData.js';
import SEO from './SEO';
import AdsterraBanner from './AdsterraBanner';

export default function BlogArticle({ darkMode }) {
  const { slug } = useParams();
  const [rating, setRating] = React.useState(0);
  const [ratingHover, setRatingHover] = React.useState(0);
  const [ratingSubmitted, setRatingSubmitted] = React.useState(false);

  // Look up current article
  const article = blogArticles.find((art) => art.slug === slug);

  if (!article) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center p-6 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-slate-50 to-blue-50 text-slate-950'}`}>
        <div className={`p-8 rounded-2xl shadow-xl max-w-md w-full text-center border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
          <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
          <p className="text-sm opacity-80 mb-6">The educational article you are looking for does not exist or has been moved.</p>
          <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition duration-150">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Get other articles for "Read Next" (exclude current one)
  const relatedArticles = blogArticles.filter((art) => art.slug !== slug).slice(0, 3);

  // Render a paragraph cleanly, turning bullet formatting or math formulas into beautiful layouts
  const renderParagraph = (text, index) => {
    if (text.startsWith("• Formula:")) {
      return (
        <div key={index} className={`my-4 p-4 rounded-xl border font-mono text-center ${darkMode ? 'bg-blue-950/40 border-blue-900 text-blue-200 shadow-inner' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
          <span className="font-sans font-bold block mb-1">🧮 Conversion Formula:</span>
          {text.replace("• Formula: ", "")}
        </div>
      );
    }
    if (text.startsWith("• Calculations:")) {
      return (
        <div key={index} className={`my-4 p-4 rounded-xl border font-mono text-center ${darkMode ? 'bg-indigo-950/40 border-indigo-900 text-indigo-200 shadow-inner' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
          <span className="font-sans font-bold block mb-1">✏️ Example Calculation:</span>
          {text.replace("• Calculations: ", "")}
        </div>
      );
    }
    if (text.startsWith("• ") || text.startsWith("- ")) {
      const cleanText = text.substring(2);
      const isBoldLabel = cleanText.includes(":");
      if (isBoldLabel) {
        const parts = cleanText.split(":");
        return (
          <li key={index} className="list-none pl-6 relative before:content-['•'] before:absolute before:left-2 before:text-blue-500 font-medium text-sm leading-relaxed mb-2">
            <span className="font-bold text-blue-600 dark:text-blue-400">{parts[0]}:</span> {parts.slice(1).join(":")}
          </li>
        );
      }
      return (
        <li key={index} className="list-none pl-6 relative before:content-['•'] before:absolute before:left-2 before:text-blue-500 text-sm leading-relaxed mb-2">
          {cleanText}
        </li>
      );
    }
    if (text.match(/^\d+\.\s/)) {
      const cleanText = text.replace(/^\d+\.\s/, "");
      const parts = cleanText.split(":");
      if (parts.length > 1) {
        return (
          <li key={index} className="list-decimal list-inside text-sm leading-relaxed mb-2 pl-2">
            <span className="font-bold text-blue-600 dark:text-blue-400">{parts[0]}:</span> {parts.slice(1).join(":")}
          </li>
        );
      }
      return (
        <li key={index} className="list-decimal list-inside text-sm leading-relaxed mb-2 pl-2">
          {cleanText}
        </li>
      );
    }
    return (
      <p key={index} className="text-sm md:text-base leading-relaxed mb-4 opacity-90 text-justify">
        {text}
      </p>
    );
  };

  return (
    <>
      <SEO
        title={`${article.title} | Smart Student Tools`}
        description={article.description}
        url={`https://smartstudenttools.xyz/blog/${article.slug}`}
      />
      <div className={`min-h-screen px-4 md:px-8 pb-12 pt-7 transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-950'}`}>
        <article className="mx-auto max-w-4xl space-y-6">
          
          {/* Breadcrumbs */}
          <nav className="text-xs md:text-sm opacity-70 flex items-center gap-2">
            <Link to="/" className="hover:underline hover:text-blue-500">Dashboard</Link>
            <span>/</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">Blog</span>
            <span>/</span>
            <span className="truncate max-w-[200px]">{article.title}</span>
          </nav>

          {/* Article Card */}
          <div className={`p-6 md:p-10 rounded-3xl shadow-xl border space-y-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <header className="space-y-4 border-b border-gray-200 dark:border-gray-700 pb-6">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                {article.category}
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
                {article.title}
              </h1>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm opacity-80 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">✍️</span>
                  <span className="font-semibold">{article.author}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                <div>{article.date}</div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                <div className="flex items-center gap-1">
                  <span>⏱️</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </header>

            {/* Render Cover Image if present */}
            {article.coverImage && (
              <div className="w-full flex justify-center mb-6">
                <img 
                  src={article.coverImage} 
                  alt={article.title} 
                  className="w-full h-auto max-h-[420px] object-cover rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md" 
                />
              </div>
            )}

            {/* Render Sections */}
            <main className="space-y-6 pt-2">
              {article.sections.map((section, idx) => (
                <section key={idx} className="space-y-3">
                  {section.heading !== "Introduction" && (
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-blue-650 dark:text-blue-400 mt-6 border-l-4 border-blue-500 pl-3">
                      {section.heading}
                    </h2>
                  )}
                  <div className="space-y-2">
                    {section.paragraphs.map((para, pIdx) => renderParagraph(para, pIdx))}
                  </div>
                  {section.image && (
                    <div className="my-6 flex flex-col items-center">
                      <img 
                        src={section.image.src} 
                        alt={section.image.alt || ""} 
                        className="w-full max-w-2xl h-auto rounded-xl shadow-md border border-gray-200 dark:border-gray-700" 
                      />
                      {section.image.caption && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center italic">{section.image.caption}</p>
                      )}
                    </div>
                  )}
                </section>
              ))}
            </main>

            {/* Ad Banner placement inside post */}
            <div className="pt-4">
              <AdsterraBanner />
            </div>

            {/* Star Rating Widget */}
            <footer className={`mt-8 pt-6 border-t text-center ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h4 className="font-bold text-lg mb-2">Did this article help you?</h4>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Rate this post to support more free educational calculators</p>
              {ratingSubmitted ? (
                <p className="text-green-600 dark:text-green-400 font-semibold">Thank you for your rating of {rating} stars!</p>
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
            </footer>
          </div>

          {/* Related Articles Area */}
          <div className="space-y-4 pt-4">
            <h3 className="text-xl font-extrabold tracking-tight">Read Next</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((art) => (
                <Link
                  key={art.slug}
                  to={`/blog/${art.slug}`}
                  className={`group p-5 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
                      : 'bg-white border-gray-200 hover:border-blue-400'
                  }`}
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-blue-500">{art.category}</span>
                    <h4 className="font-bold text-sm mt-1 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {art.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-[11px] opacity-70">
                    <span>⏱️ {art.readTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </article>
      </div>
    </>
  );
}
