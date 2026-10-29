import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import blogPosts from './blogPostsData';
import SEO from './SEO';
import AdsterraBanner from './AdsterraBanner';

const BlogPost = ({ darkMode }) => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const post = blogPosts.find(p => p.slug === slug);

  // If slug doesn't match any post, redirect to blog list
  if (!post) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
        <Link to="/blog" className="text-blue-600 underline">← Back to Blog</Link>
      </div>
    );
  }

  const relatedPosts = blogPosts.filter(p => p.slug !== slug && p.category === post.category);
  const otherPosts = blogPosts.filter(p => p.slug !== slug && p.category !== post.category);
  const readNext = [...relatedPosts, ...otherPosts].slice(0, 2);

  return (
    <>
      <SEO
        title={`${post.title} | Smart Student Tools Blog`}
        description={post.description}
        url={`https://smartstudenttools.xyz/blog/${post.slug}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          'headline': post.title,
          'description': post.description,
          'datePublished': post.date,
          'publisher': {
            '@type': 'Organization',
            'name': 'Smart Student Tools',
            'url': 'https://smartstudenttools.xyz/'
          },
          'keywords': post.keywords.join(', ')
        }}
      />

      <div className={`min-h-screen py-10 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-3xl mx-auto">

          {/* Back Button */}
          <Link
            to="/blog"
            className={`inline-flex items-center gap-2 text-sm mb-8 font-semibold transition-colors duration-200
              ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-700 hover:text-blue-900'}`}
          >
            ← Back to Blog
          </Link>

          {/* Article Header */}
          <article>
            <div className="mb-6">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                post.category === 'GPA & Grades' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                post.category === 'Attendance & Academics' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
              }`}>
                {post.category}
              </span>
            </div>

            <h1 className={`text-3xl md:text-4xl font-extrabold leading-tight mb-4
              ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {post.title}
            </h1>

            <div className={`flex gap-6 text-sm mb-8 pb-6 border-b
              ${darkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
              <span>🗓 {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span>⏱ {post.readTime}</span>
            </div>

            {/* Top Ad */}
            <div className="my-6">
              <AdsterraBanner />
            </div>

            {/* Article Body */}
            <div
              className={`prose max-w-none
                ${darkMode
                  ? 'prose-invert text-gray-200'
                  : 'text-gray-800'
                }
                prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:leading-relaxed prose-p:mb-4
                prose-ul:mb-4 prose-ol:mb-4
                prose-li:mb-1
                prose-pre:rounded-lg prose-pre:p-4
                prose-a:text-blue-600 prose-a:underline
                prose-table:w-full prose-table:border-collapse
              `}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Middle Ad */}
            <div className="my-10">
              <AdsterraBanner />
            </div>

            {/* Keywords / Tags */}
            <div className={`flex flex-wrap gap-2 mt-8 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              {post.keywords.map(kw => (
                <span key={kw} className={`text-xs px-3 py-1 rounded-full font-medium
                  ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                  #{kw.replace(/ /g, '')}
                </span>
              ))}
            </div>
          </article>

          {/* Read Next */}
          {readNext.length > 0 && (
            <div className="mt-14">
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                📖 Read Next
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {readNext.map(related => (
                  <Link
                    key={related.slug}
                    to={`/blog/${related.slug}`}
                    className={`p-5 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 group
                      ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-600' : 'bg-white border-gray-200 hover:border-blue-400'}`}
                  >
                    <span className={`text-xs font-bold px-2 py-1 rounded-full block w-fit mb-3 ${
                      related.category === 'GPA & Grades' ? 'bg-blue-100 text-blue-800' :
                      related.category === 'Attendance & Academics' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {related.category}
                    </span>
                    <h3 className={`text-sm font-bold leading-snug group-hover:text-blue-600 transition-colors duration-200
                      ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {related.title}
                    </h3>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {related.readTime}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div className={`mt-14 p-8 rounded-2xl text-center shadow-inner ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border border-blue-100'}`}>
            <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Try the tools mentioned in this article
            </h3>
            <p className={`text-sm mb-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Free, no login, privacy-first calculators and trackers built for students.
            </p>
            <Link
              to="/"
              className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Open Smart Student Tools →
            </Link>
          </div>

        </div>
      </div>
    </>
  );
};

export default BlogPost;
