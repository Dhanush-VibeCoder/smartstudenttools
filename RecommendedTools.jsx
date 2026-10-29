import React from 'react';
import { Link } from 'react-router-dom';

const ALL_TOOLS = [
  {
    id: 'attendance-tracker',
    path: '/attendance-tracker',
    title: '75% Attendance Tracker',
    icon: '🗓️',
    badge: 'Popular',
    desc: 'Calculate how many classes you can safely skip or need to attend for 75%.'
  },
  {
    id: 'gpa-converter',
    path: '/gpa-converter',
    title: 'CGPA to % Converter',
    icon: '🎓',
    badge: 'Academic',
    desc: 'Convert 10.0 & 4.0 scale CGPA to percentage using university formulas.'
  },
  {
    id: 'citation-generator',
    path: '/citation-generator',
    title: 'IEEE & APA Citation Maker',
    icon: '📑',
    badge: 'New & Free',
    desc: 'Format instant IEEE, APA 7, and MLA references for seminar and thesis reports.'
  },
  {
    id: 'grade-calculator',
    path: '/grade-calculator',
    title: 'Final Exam Grade Calculator',
    icon: '🎯',
    badge: 'Exams',
    desc: 'Find out the exact marks you need in final exams to score your target grade.'
  },
  {
    id: 'backlog-tracker',
    path: '/backlog-tracker',
    title: 'Arrears & Backlog Tracker',
    icon: '📚',
    badge: 'Planning',
    desc: 'Track semester-wise pending subjects and keep your placement eligibility safe.'
  },
  {
    id: 'study-planner',
    path: '/study-planner',
    title: 'Exam Study Timetable',
    icon: '📅',
    badge: 'Revision',
    desc: 'Organize daily study blocks and revision schedules before exams.'
  },
  {
    id: 'image-to-text',
    path: '/image-to-text',
    title: 'Image to Text (OCR)',
    icon: '🔍',
    badge: 'Productivity',
    desc: 'Extract handwritten notes, textbook pages, and screenshots into editable text.'
  },
  {
    id: 'merge-pdf',
    path: '/merge-pdf',
    title: 'Merge PDF Files',
    icon: '📎',
    badge: 'PDF Tool',
    desc: 'Combine multiple PDF files into one document instantly — no upload required.'
  },
  {
    id: 'split-pdf',
    path: '/split-pdf',
    title: 'Split PDF Pages',
    icon: '✂️',
    badge: 'PDF Tool',
    desc: 'Extract specific pages or split a PDF into individual files right in your browser.'
  },
  {
    id: 'lock-pdf',
    path: '/lock-pdf',
    title: 'Lock PDF with Password',
    icon: '🔒',
    badge: 'PDF Tool',
    desc: 'Password-protect your PDF files before sharing assignments or project reports.'
  },
  {
    id: 'unlock-pdf',
    path: '/unlock-pdf',
    title: 'Unlock PDF Password',
    icon: '🔓',
    badge: 'PDF Tool',
    desc: 'Remove passwords from PDF files you own — fully offline and private.'
  },
  {
    id: 'image-to-pdf',
    path: '/image-to-pdf',
    title: 'Image to PDF Converter',
    icon: '🖼️',
    badge: 'Converter',
    desc: 'Turn JPG, PNG, or WEBP images into a clean PDF document for submission.'
  },
  {
    id: 'compress-image',
    path: '/compress-image',
    title: 'Compress Image Online',
    icon: '📦',
    badge: 'Productivity',
    desc: 'Reduce image file size for email, assignments, and college portals without quality loss.'
  },
  {
    id: 'resize-image',
    path: '/resize-image',
    title: 'Resize Image Online',
    icon: '📐',
    badge: 'Productivity',
    desc: 'Resize photos to exact pixels or percentage — perfect for profile pictures and forms.'
  }
];

const RecommendedTools = ({ currentTool, darkMode }) => {
  // Filter out the current tool and take the top 3 recommendations
  const recommended = ALL_TOOLS.filter(t => t.id !== currentTool).slice(0, 3);

  return (
    <div className={`p-5 rounded-2xl border transition-all mt-6 ${
      darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <h3 className={`font-bold text-base md:text-lg ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Next Recommended Tools
          </h3>
        </div>
        <span className="text-xs uppercase tracking-wider font-semibold opacity-70">
          Smart Studies Suite
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {recommended.map(tool => (
          <Link
            key={tool.id}
            to={tool.path}
            className={`group p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between hover:shadow-md transform hover:-translate-y-0.5 ${
              darkMode
                ? 'bg-gray-900/70 border-gray-700/80 hover:border-blue-500 hover:bg-gray-900'
                : 'bg-white border-blue-100 hover:border-blue-400 hover:shadow-blue-100'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{tool.icon}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  tool.badge === 'New & Free'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                }`}>
                  {tool.badge}
                </span>
              </div>
              <h4 className={`font-bold text-sm mb-1 group-hover:text-blue-600 transition-colors ${
                darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {tool.title}
              </h4>
              <p className={`text-xs line-clamp-2 leading-relaxed ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {tool.desc}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
              <span>Open Tool</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendedTools;

