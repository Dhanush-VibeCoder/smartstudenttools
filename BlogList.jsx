import React from 'react';
import { Link } from 'react-router-dom';
import blogPosts from './blogPostsData';
import SEO from './SEO';
import AdsterraBanner from './AdsterraBanner';

const CATEGORY_COLORS = {
  'GPA & Grades': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Attendance & Academics': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Student Budget': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

const BlogList = ({ darkMode }) => {
  const [activeCategory, setActiveCategory] = React.useState('All');

  const categories = ['All', ...new Set(blogPosts.map(p => p.category))];

  const filtered = activeCategory === 'All'
    ? blogPosts
    : blogPosts.filter(p => p.category === activeCategory);

  return (
    <>
      <SEO
        title="Blog - Smart Student Tools | GPA, Attendance & Study Tips"
        description="Read guides and tips on CGPA conversion, managing the 75% attendance rule, printing cost budgeting, and more academic tools for college students."
        url="https://smartstudenttools.xyz/blog"
      />
      <div className={`min-h-screen py-12 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className={`text-4xl font-extrabold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📚 Student Resource Blog
            </h1>
            <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Practical guides to help you understand CGPA formulas, manage attendance, and plan your academic budget.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm
                  ${activeCategory === cat
                    ? 'bg-blue-700 text-white shadow-md scale-105'
                    : darkMode
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-blue-50'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Ad */}
          <div className="my-6">
            <AdsterraBanner />
          </div>

          {/* Blog Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(post => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className={`group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col
                  ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}
              >
                {/* Card Header Color Band */}
                <div className={`h-2 w-full ${
                  post.category === 'GPA & Grades' ? 'bg-blue-600' :
                  post.category === 'Attendance & Academics' ? 'bg-green-600' :
                  'bg-orange-500'
                }`} />

                <div className="p-6 flex flex-col flex-1">
                  {/* Category Badge */}
                  <span className={`text-xs font-bold px-3 py-1 rounded-full self-start mb-4 ${CATEGORY_COLORS[post.category]}`}>
                    {post.category}
                  </span>

                  {/* Title */}
                  <h2 className={`text-lg font-bold mb-3 leading-snug group-hover:text-blue-600 transition-colors duration-200 flex-1
                    ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {post.title}
                  </h2>

                  {/* Description */}
                  <p className={`text-sm mb-4 line-clamp-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {post.description}
                  </p>

                  {/* Footer */}
                  <div className={`flex justify-between items-center text-xs mt-auto pt-4 border-t
                    ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-gray-500'}`}>
                    <span>🗓 {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>⏱ {post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom Ad */}
          <div className="mt-12">
            <AdsterraBanner />
          </div>

          {/* CTA block */}
          <div className={`mt-12 p-8 rounded-2xl text-center shadow-inner ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border border-blue-100'}`}>
            <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Ready to use the tools?
            </h3>
            <p className={`text-sm mb-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              All calculators are 100% free, no login required, and run locally in your browser.
            </p>
            <Link
              to="/"
              className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Explore Tools →
            </Link>
          </div>

        </div>
      </div>
    </>
  );
};

export default BlogList;
