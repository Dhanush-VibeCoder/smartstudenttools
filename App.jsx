import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import PrivacyPolicy from './PrivacyPolicy';
import About from './About';
import Contact from './Contact';
import TermsConditions from './TermsConditions';
import AdsterraBanner from './AdsterraBanner';
import { Analytics } from '@vercel/analytics/react';
import StandardCalculator from './StandardCalculator';
import PercentageCalculator from './PercentageCalculator';
import GSTCalculator from './GSTCalculator';
import PrintingCostCalculator from './PrintingCostCalculator';
import ExpenseTracker from './ExpenseTracker';
import ScientificCalculator from './ScientificCalculator';
import FinancialCalculator from './FinancialCalculator';
import CurrencyConverter from './CurrencyConverter';
import BMICalculator from './BMI_Calculator.jsx';
import UnitConverter from './UnitConverter.jsx';
import SEO from './SEO';
import PasteImageConverter from './PasteImageConverter.jsx';
import UploadImageConverter from './UploadImageConverter.jsx';
import ResizeImageTool from './ResizeImageTool.jsx';
import CompressImageTool from './CompressImageTool.jsx';
import BlogArticle from './BlogArticle.jsx';
import ReactGA from 'react-ga4';

// Initialize GA4 with fallback or environment variable
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-S6V4E7B4RD";
ReactGA.initialize(GA_MEASUREMENT_ID);


const GPAConverterTool = lazy(() => import('./GPAConverterTool.jsx'));
const AttendanceTracker = lazy(() => import('./AttendanceTracker.jsx'));
const GradeCalculator = lazy(() => import('./GradeCalculator.jsx'));
const BacklogTracker = lazy(() => import('./BacklogTracker.jsx'));
const StudyPlanner = lazy(() => import('./StudyPlanner.jsx'));
const ExamScorePredictor = lazy(() => import('./ExamScorePredictor.jsx'));
const BranchPredictor = lazy(() => import('./BranchPredictor.jsx'));
const MergePdfTool = lazy(() => import('./MergePdfTool.jsx'));
const LockPdfTool = lazy(() => import('./LockPdfTool.jsx'));
const UnlockPdfTool = lazy(() => import('./UnlockPdfTool.jsx'));
const ImageToPdfTool = lazy(() => import('./ImageToPdfTool.jsx'));
const SplitPdfTool = lazy(() => import('./SplitPdfTool.jsx'));
const ImageToTextTool = lazy(() => import('./ImageToTextTool.jsx'));
const GeminiWatermarkRemover = lazy(() => import('./GeminiWatermarkRemover.jsx'));


// Placeholder for Lucide-like icons (replace with actual Lucide imports if used outside Canvas)
const Icon = ({ name, className }) => {
  let pathData = "";
  let size = "24"; // Default size for SVG
  switch (name) {
    case 'Book':
      pathData = "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20";
      break;
    case 'Calculator':
      pathData = "M12 2v20M5 9h14M5 15h14M18 2h-4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z";
      break;
    case 'GraduationCap':
      pathData = "M22 10v6m-3-1a3 3 0 0 1-3-3m-6 0a3 3 0 0 1-3 3m12-3v6a3 3 0 0 1-6 0v-6a3 3 0 0 1 6 0z";
      break;
    case 'TrendingUp':
      pathData = "M22 7l-9.5 9.5-5-5L2 17";
      break;
    case 'Calendar':
      pathData = "M8 2v4M16 2v4M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM1 9h22";
      break;
    case 'Target':
      pathData = "M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0m0 9a9 9 0 1 0 0-18a9 9 0 0 0 0 18z";
      break;
    case 'Brain':
      pathData = "M8 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8zM16 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8zM12 20a4 4 0 1 0 0-8a4 4 0 0 0 0 8z";
      break;
    case 'GitFork':
      pathData = "M12 19V6M9 6a3 3 0 1 0 0-6a3 3 0 0 0 0 6zM15 6a3 3 0 1 0 0-6a3 3 0 0 0 0 6zM12 19a3 3 0 1 0 0 6a3 3 0 0 0 0-6z";
      break;
    case 'Smartphone':
      pathData = "M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM12 18h.01";
      break;
    case 'Zap':
      pathData = "M13 2L3 14h9l-1 8L21 10h-9L13 2z";
      break;
    case 'Sparkles':
      pathData = "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8z";
      break;
    case 'DollarSign':
      pathData = "M12 1v22m-7-5h14a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z";
      break;
    case 'UserX':
      pathData = "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M18 8a3 3 0 1 0 0-6a3 3 0 0 0 0 6zM18 17l6-6m-6 0l6 6";
      break;
    case 'ChartBar': // For Grade Calculator
      pathData = "M12 20V10M18 20V4M6 20v-4";
      break;
    case 'Users': // For Attendance Calculator
      pathData = "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0a4 4 0 0 1 8 0z";
      break;
    case 'ClipboardList': // For Backlog Tracker
      pathData = "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M12 2v4M12 14h.01M12 10h.01M12 18h.01";
      break;
    case 'Edit3': // For Study Planner
      pathData = "M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z";
      break;
    case 'Search': // For Exam Score Predictor
      pathData = "M11 11m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0m11 11l6-6";
      break;
    case 'Compass': // For Career/Branch Predictor
      pathData = "M8 16a8 8 0 0 1 0-16a8 8 0 0 1 0 16zM12 12l6 6m-6-6l6-6m-6 6l-6 6m6-6l-6-6";
      break;
    case 'FileText': // For PDF Compressor
      pathData = "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8";
      break;
    default:
      pathData = "M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20z"; // Default to a circle icon
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={pathData} />
    </svg>
  );
};

// Sidebar content helper
const SidebarContent = ({ tools, calculators, imageTools, pdfTools, aiTools, currentPath, calculatorsExpanded, setCalculatorsExpanded, imageToolsExpanded, setImageToolsExpanded, pdfToolsExpanded, setPdfToolsExpanded, aiToolsExpanded, setAiToolsExpanded, setIsOpen, darkMode, collapsed, toggleCollapsed }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden text-white">
      {/* Header row with logo and collapse button */}
      <div className={`flex items-center mb-5 pb-4 border-b border-blue-600/40 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div
          className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out ${
            collapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-auto opacity-100'
          }`}
        >
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full bg-white shadow flex-shrink-0" />
          <span className="font-bold text-base whitespace-nowrap text-white">Student Portal</span>
        </div>
        {toggleCollapsed && (
          <button
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg transition-all duration-200 bg-blue-600/30 hover:bg-blue-500/50 text-blue-200 hover:text-white focus:outline-none flex-shrink-0"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ease-in-out ${collapsed ? 'rotate-180' : 'rotate-0'}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-blue-600">
        {/* Academic Dashboards section */}
        <div>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              collapsed ? 'max-h-0 opacity-0 mb-0' : 'max-h-8 opacity-100 mb-1'
            }`}
          >
            <h3 className="px-3 text-xs font-semibold text-blue-300 uppercase tracking-widest">
              Academic
            </h3>
          </div>
          <div className="space-y-0.5">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              title={collapsed ? 'Overview / Home' : undefined}
              className={`flex items-center py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                collapsed ? 'justify-center px-2' : 'px-3'
              } ${
                currentPath === '/' && !window.location.hash
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon name="Book" className="w-5 h-5 flex-shrink-0 text-blue-300 group-hover:text-white transition-colors duration-150" />
              <span
                className={`ml-3 truncate transition-all duration-300 ease-in-out ${
                  collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
                }`}
              >Overview / Home</span>
            </Link>
            {tools.map((tool) => (
              <Link
                key={tool.id}
                to={tool.path}
                onClick={() => setIsOpen(false)}
                title={collapsed ? tool.title : undefined}
                className={`flex items-center py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  collapsed ? 'justify-center px-2' : 'px-3'
                } ${
                  currentPath === tool.path
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon name={tool.icon} className="w-5 h-5 flex-shrink-0 text-blue-300 group-hover:text-white transition-colors duration-150" />
                <span
                  className={`ml-3 truncate text-left transition-all duration-300 ease-in-out ${
                    collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
                  }`}
                >{tool.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Calculators section */}
        <div>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              collapsed ? 'max-h-0 opacity-0' : 'max-h-8 opacity-100'
            }`}
          >
            <button
              onClick={() => setCalculatorsExpanded(!calculatorsExpanded)}
              className="w-full flex items-center justify-between px-3 mb-1 text-xs font-semibold text-blue-300 uppercase tracking-widest focus:outline-none hover:text-white transition-colors duration-150"
            >
              <span>Calculators</span>
              <span className={`text-xs transition-transform duration-200 ${calculatorsExpanded ? 'rotate-180' : 'rotate-0'}`}>
                ▼
              </span>
            </button>
          </div>

          {/* Expanded calc list */}
          {!collapsed && calculatorsExpanded && (
            <div className="space-y-0.5 pl-2 border-l border-blue-500/30">
              {calculators.map((calc) => (
                <Link
                  key={calc.path}
                  to={calc.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    currentPath === calc.path
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon name="Calculator" className="w-4 h-4 mr-3 text-blue-300 group-hover:text-white flex-shrink-0 transition-colors duration-150" />
                  <span className="truncate">{calc.label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Collapsed calc icons */}
          {collapsed && (
            <div className="space-y-0.5">
              {calculators.map((calc) => (
                <Link
                  key={calc.path}
                  to={calc.path}
                  onClick={() => setIsOpen(false)}
                  title={calc.label}
                  className={`flex items-center justify-center px-2 py-1.5 rounded-lg transition-all duration-200 group ${
                    currentPath === calc.path
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon name="Calculator" className="w-5 h-5 text-blue-300 group-hover:text-white transition-colors duration-150" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Image Tools section */}
        <div>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              collapsed ? 'max-h-0 opacity-0' : 'max-h-8 opacity-100'
            }`}
          >
            <button
              onClick={() => setImageToolsExpanded(!imageToolsExpanded)}
              className="w-full flex items-center justify-between px-3 mb-1 text-xs font-semibold text-blue-300 uppercase tracking-widest focus:outline-none hover:text-white transition-colors duration-150"
            >
              <span>Image Tools</span>
              <span className={`text-xs transition-transform duration-200 ${imageToolsExpanded ? 'rotate-180' : 'rotate-0'}`}>
                ▼
              </span>
            </button>
          </div>

          {!collapsed && imageToolsExpanded && (
            <div className="space-y-0.5 pl-2 border-l border-blue-500/30">
              {imageTools.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    currentPath === tool.path
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4 mr-3 text-blue-300 group-hover:text-white flex-shrink-0 transition-colors duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" />
                    <path d="M21 15l-5-5L5 21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="truncate">{tool.label}</span>
                </Link>
              ))}
            </div>
          )}

          {collapsed && (
            <div className="space-y-0.5">
              {imageTools.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  onClick={() => setIsOpen(false)}
                  title={tool.label}
                  className={`flex items-center justify-center px-2 py-1.5 rounded-lg transition-all duration-200 group ${
                    currentPath === tool.path
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5 text-blue-300 group-hover:text-white transition-colors duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" />
                    <path d="M21 15l-5-5L5 21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
          {/* PDF Tools section */}
          <div>
            <div
               className={`overflow-hidden transition-all duration-300 ease-in-out ${
                 collapsed ? 'max-h-0 opacity-0' : 'max-h-8 opacity-100'
               }`}
            >
              <button
                onClick={() => setPdfToolsExpanded(!pdfToolsExpanded)}
                className="w-full flex items-center justify-between px-3 mb-1 text-xs font-semibold text-blue-300 uppercase tracking-widest focus:outline-none hover:text-white transition-colors duration-150"
              >
                <span>PDF Tools</span>
                <span className={`text-xs transition-transform duration-200 ${pdfToolsExpanded ? 'rotate-180' : 'rotate-0'}`}>
                  ▼
                </span>
              </button>
            </div>

            {!collapsed && pdfToolsExpanded && (
              <div className="space-y-0.5 pl-2 border-l border-blue-500/30">
                {pdfTools.map((tool) => (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                      currentPath === tool.path
                        ? 'bg-white/15 text-white shadow-sm'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon name={tool.icon} className="w-4 h-4 mr-3 text-blue-300 group-hover:text-white flex-shrink-0 transition-colors duration-150" />
                    <span className="truncate">{tool.label}</span>
                  </Link>
                ))}
              </div>
            )}

            {collapsed && (
              <div className="space-y-0.5">
                {pdfTools.map((tool) => (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    onClick={() => setIsOpen(false)}
                    title={tool.label}
                    className={`flex items-center justify-center px-2 py-1.5 rounded-lg transition-all duration-200 group ${
                      currentPath === tool.path
                        ? 'bg-white/15 text-white shadow-sm'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon name={tool.icon} className="w-5 h-5 text-blue-300 group-hover:text-white transition-colors duration-150" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Tools section */}
        <div>
          <div
             className={`overflow-hidden transition-all duration-300 ease-in-out ${
               collapsed ? 'max-h-0 opacity-0' : 'max-h-8 opacity-100'
             }`}
          >
            <button
              onClick={() => setAiToolsExpanded(!aiToolsExpanded)}
              className="w-full flex items-center justify-between px-3 mb-1 text-xs font-semibold text-blue-300 uppercase tracking-widest focus:outline-none hover:text-white transition-colors duration-150"
            >
              <span>AI Tools</span>
              <span className={`text-xs transition-transform duration-200 ${aiToolsExpanded ? 'rotate-180' : 'rotate-0'}`}>
                ▼
              </span>
            </button>
          </div>

          {!collapsed && aiToolsExpanded && (
            <div className="space-y-0.5 pl-2 border-l border-blue-500/30">
              {aiTools.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    currentPath === tool.path
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon name={tool.icon} className="w-4 h-4 mr-3 text-blue-300 group-hover:text-white flex-shrink-0 transition-colors duration-150" />
                  <span className="truncate">{tool.label}</span>
                </Link>
              ))}
            </div>
          )}

          {collapsed && (
            <div className="space-y-0.5">
              {aiTools.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  onClick={() => setIsOpen(false)}
                  title={tool.label}
                  className={`flex items-center justify-center px-2 py-1.5 rounded-lg transition-all duration-200 group ${
                    currentPath === tool.path
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon name={tool.icon} className="w-5 h-5 text-blue-300 group-hover:text-white transition-colors duration-150" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Footer links */}
      <div
        className={`pt-4 border-t border-blue-600/40 transition-all duration-300 ease-in-out overflow-hidden ${
          collapsed ? 'max-h-0 opacity-0 border-transparent' : 'max-h-40 opacity-100'
        }`}
      >
        <div className="text-xs text-blue-300 space-y-1 px-3">
          <Link to="/about" className="block hover:text-white transition-colors duration-150" onClick={() => setIsOpen(false)}>About Us</Link>
          <Link to="/contact" className="block hover:text-white transition-colors duration-150" onClick={() => setIsOpen(false)}>Contact Support</Link>
          <Link to="/privacy-policy" className="block hover:text-white transition-colors duration-150" onClick={() => setIsOpen(false)}>Privacy Policy</Link>
          <Link to="/terms-conditions" className="block hover:text-white transition-colors duration-150" onClick={() => setIsOpen(false)}>Terms &amp; Conditions</Link>
        </div>
      </div>
    </div>
  );
};

// Sidebar component
const Sidebar = ({ isOpen, setIsOpen, darkMode, tools, imageTools, pdfTools, aiTools, collapsed, setCollapsed }) => {
  const location = useLocation();
  const [calculatorsExpanded, setCalculatorsExpanded] = useState(true);
  const [imageToolsExpanded, setImageToolsExpanded] = useState(true);
  const [pdfToolsExpanded, setPdfToolsExpanded] = useState(true);
  const [aiToolsExpanded, setAiToolsExpanded] = useState(true);

  const calculators = [
    { path: '/calculator', label: 'Standard Calculator' },
    { path: '/gpa-converter', label: 'CGPA Converter' },
    { path: '/percentage-calculator', label: 'Percentage Calculator' },
    { path: '/gst-calculator', label: 'GST Calculator' },
    { path: '/printing-cost-calculator', label: 'Printing Cost Calculator' },
    { path: '/expense-tracker', label: 'Expense Tracker' },
    { path: '/scientific-calculator', label: 'Scientific Calculator' },
    { path: '/financial-calculator', label: 'Financial Calculator' },
    { path: '/currency-converter', label: 'Currency Converter' },
    { path: '/bmi-calculator', label: 'BMI Calculator' },
    { path: '/unit-converter', label: 'Unit Converter' },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`border-r border-blue-900/40 p-4 hidden md:flex flex-col h-screen sticky top-0 z-40
          transition-[width] duration-300 ease-in-out
          ${ darkMode
            ? 'bg-gradient-to-b from-gray-900 to-gray-800'
            : 'bg-gradient-to-b from-blue-800 to-blue-900'
          } ${ collapsed ? 'w-16' : 'w-64' }`}
      >
        <SidebarContent
          tools={tools}
          calculators={calculators}
          imageTools={imageTools}
          pdfTools={pdfTools}
          aiTools={aiTools}
          currentPath={location.pathname}
          calculatorsExpanded={calculatorsExpanded}
          setCalculatorsExpanded={setCalculatorsExpanded}
          imageToolsExpanded={imageToolsExpanded}
          setImageToolsExpanded={setImageToolsExpanded}
          pdfToolsExpanded={pdfToolsExpanded}
          setPdfToolsExpanded={setPdfToolsExpanded}
          aiToolsExpanded={aiToolsExpanded}
          setAiToolsExpanded={setAiToolsExpanded}
          setIsOpen={setIsOpen}
          darkMode={darkMode}
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
        />
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          ></div>
          <aside className={`relative w-64 max-w-xs flex-1 flex flex-col p-4 shadow-2xl ${
            darkMode
              ? 'bg-gradient-to-b from-gray-900 to-gray-800'
              : 'bg-gradient-to-b from-blue-800 to-blue-900'
          }`}>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-500/50 text-blue-200 hover:text-white focus:outline-none transition-all duration-200"
              aria-label="Close Sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SidebarContent
              tools={tools}
              calculators={calculators}
              imageTools={imageTools}
              pdfTools={pdfTools}
              aiTools={aiTools}
              currentPath={location.pathname}
              calculatorsExpanded={calculatorsExpanded}
              setCalculatorsExpanded={setCalculatorsExpanded}
              imageToolsExpanded={imageToolsExpanded}
              setImageToolsExpanded={setImageToolsExpanded}
              pdfToolsExpanded={pdfToolsExpanded}
              setPdfToolsExpanded={setPdfToolsExpanded}
              aiToolsExpanded={aiToolsExpanded}
              setAiToolsExpanded={setAiToolsExpanded}
              setIsOpen={setIsOpen}
              darkMode={darkMode}
              collapsed={false}
            />
          </aside>
        </div>
      )}
    </>
  );
};

// Simplified Header component
const AppHeader = ({ darkMode, toggleDarkMode, sidebarOpen, setSidebarOpen }) => {
  return (
    <header className={`${darkMode ? 'bg-gray-800' : 'bg-blue-700'} text-white p-4 shadow-md sticky top-0 z-30`}>
      <div className="container mx-auto flex justify-between items-center py-1 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-opacity-20 hover:bg-white focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full mr-3 bg-white shadow" />
            <span className="text-xl md:text-2xl font-bold">Smart Student Tools</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-200 focus:outline-none ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-800 hover:bg-blue-900'}`}
            title="Toggle dark mode"
          >
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </header>
  );
};

// Google Analytics page view tracking component
function GA4Tracker() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
    });
  }, [location]);

  return null;
}

// Scroll restoration component to reset viewport on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Main App component for the Smart Student Tools home page
const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Scroll to hash in URL if present on load or transition
  useEffect(() => {
    if (location.hash) {
      const elementId = location.hash.replace('#', '');
      const element = document.getElementById(elementId);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [location]);

  const tools = [
    {
      id: 'cgpa-converter',
      path: '/gpa-converter',
      icon: 'GraduationCap',
      title: 'CGPA to Percentage Converter',
      description: 'Convert your CGPA into percentage for various needs.',
      component: GPAConverterTool,
    },
    {
      id: 'attendance-tracker',
      path: '/attendance-tracker',
      icon: 'Users',
      title: 'Attendance Tracker',
      description: 'Track and manage your class attendance easily.',
      component: AttendanceTracker,
    },
    {
      id: 'grade-calculator',
      path: '/grade-calculator',
      icon: 'ChartBar',
      title: 'Grade Calculator',
      description: 'Calculate your subject-wise grades and overall CGPA.',
      component: GradeCalculator,
    },
    {
      id: 'backlog-tracker',
      path: '/backlog-tracker',
      icon: 'ClipboardList',
      title: 'Backlog Tracker',
      description: 'Keep tabs on your pending academic tasks and visualize progress.',
      component: BacklogTracker,
    },
    {
      id: 'study-planner',
      path: '/study-planner',
      icon: 'Edit3',
      title: 'Study Planner',
      description: 'Organize your study schedule for optimal results.',
      component: StudyPlanner,
    },
    {
      id: 'exam-score-predictor',
      path: '/exam-score-predictor',
      icon: 'Search',
      title: 'Exam Score Predictor',
      description: 'Predict your potential exam scores based on performance.',
      component: ExamScorePredictor,
    },
    {
      id: 'college-branch-predictor',
      path: '/college-branch-predictor',
      icon: 'Compass',
      title: 'College Branch Predictor',
      description: 'Get insights into potential college branches based on your exam performance.',
      component: BranchPredictor,
    },
  ];

  const imageTools = [
    { path: '/paste-image-converter', label: 'Paste & Convert Image', icon: 'Image', description: 'Paste an image from your clipboard and convert to PNG, JPG, WebP, AVIF, BMP or ICO.', component: PasteImageConverter, accent: 'blue' },
    { path: '/upload-image-converter', label: 'Upload & Convert Image', icon: 'Image', description: 'Upload or drag-drop an image and convert to PNG, JPG, WebP, AVIF, BMP or ICO.', component: UploadImageConverter, accent: 'blue' },
    { path: '/image-to-text',    label: 'Image to Text (OCR)',   icon: 'Image', description: 'Extract text from screenshots, scanned notes, or images instantly in your browser.', component: ImageToTextTool,       accent: 'violet' },
    { path: '/resize-image',    label: 'Resize Image',          icon: 'Image', description: 'Resize images by custom dimensions or social media presets with aspect-ratio lock.', component: ResizeImageTool,    accent: 'violet' },
    { path: '/compress-image',  label: 'Compress Image',        icon: 'Image', description: 'Compress JPG, PNG or WebP images with quality control — preview savings before download.', component: CompressImageTool, accent: 'emerald' },
    { path: '/image-to-pdf',    label: 'Image to PDF',          icon: 'Image', description: 'Convert and compile multiple images into a single clean PDF document locally.', component: ImageToPdfTool,      accent: 'violet' },
  ];

  const pdfTools = [
    { path: '/merge-pdf', label: 'Merge PDF', icon: 'FileText', description: 'Combine multiple PDF files into one single document locally in your browser for absolute privacy.', component: MergePdfTool, accent: 'red' },
    { path: '/lock-pdf', label: 'Lock PDF', icon: 'FileText', description: 'Protect your PDF files by adding a password online for free using secure client-side encryption.', component: LockPdfTool, accent: 'indigo' },
    { path: '/unlock-pdf', label: 'Unlock PDF', icon: 'FileText', description: 'Remove the password from your PDF online for free using secure client-side decryption.', component: UnlockPdfTool, accent: 'emerald' },
    { path: '/split-pdf', label: 'Split PDF', icon: 'FileText', description: 'Split PDF files into separate documents or extract selected pages — 100% browser-based.', component: SplitPdfTool, accent: 'red' },
  ];

  const aiTools = [
    { path: '/gemini-watermark-remover', label: 'Gemini Watermark Remover', icon: 'Sparkles', description: 'Remove visible sparkle logo watermarks from Google Gemini-generated images locally using browser-based pixel reconstruction.', component: GeminiWatermarkRemover, accent: 'blue' },
  ];

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Apply dark mode class to body or root element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Smooth scroll function for internal links
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-blue-50 dark:bg-gray-900">
      <GA4Tracker />
      <ScrollToTop />
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        darkMode={darkMode}
        tools={tools}
        imageTools={imageTools}
        pdfTools={pdfTools}
        aiTools={aiTools}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="flex-1">
          <Suspense fallback={<div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>}>
            <Routes>
              <Route path="/calculator" element={<StandardCalculator />} />
              <Route path="/gpa-converter" element={<GPAConverterTool darkMode={darkMode} />} />
              <Route path="/percentage-calculator" element={<PercentageCalculator />} />
              <Route path="/gst-calculator" element={<GSTCalculator />} />
              <Route path="/printing-cost-calculator" element={<PrintingCostCalculator darkMode={darkMode} />} />
              <Route path="/expense-tracker" element={<ExpenseTracker darkMode={darkMode} />} />
              <Route path="/scientific-calculator" element={<ScientificCalculator darkMode={darkMode} />} />
              <Route path="/financial-calculator" element={<FinancialCalculator darkMode={darkMode} />} />
              <Route path="/currency-converter" element={<CurrencyConverter darkMode={darkMode} />} />
              <Route path="/bmi-calculator" element={<BMICalculator />} />
              <Route path="/unit-converter" element={<UnitConverter />} />
              
              <Route path="/attendance-tracker" element={<AttendanceTracker darkMode={darkMode} />} />
              <Route path="/grade-calculator" element={<GradeCalculator darkMode={darkMode} />} />
              <Route path="/backlog-tracker" element={<BacklogTracker darkMode={darkMode} />} />
              <Route path="/study-planner" element={<StudyPlanner darkMode={darkMode} />} />
              <Route path="/exam-score-predictor" element={<ExamScorePredictor darkMode={darkMode} />} />
              <Route path="/college-branch-predictor" element={<BranchPredictor darkMode={darkMode} />} />

              <Route path="/paste-image-converter" element={<PasteImageConverter darkMode={darkMode} />} />
              <Route path="/upload-image-converter" element={<UploadImageConverter darkMode={darkMode} />} />
              <Route path="/image-to-text" element={<ImageToTextTool darkMode={darkMode} />} />
              <Route path="/resize-image" element={<ResizeImageTool darkMode={darkMode} />} />
              <Route path="/compress-image" element={<CompressImageTool darkMode={darkMode} />} />
              <Route path="/image-to-pdf" element={<ImageToPdfTool darkMode={darkMode} />} />
              <Route path="/merge-pdf" element={<MergePdfTool darkMode={darkMode} />} />
              <Route path="/lock-pdf" element={<LockPdfTool darkMode={darkMode} />} />
              <Route path="/unlock-pdf" element={<UnlockPdfTool darkMode={darkMode} />} />
              <Route path="/split-pdf" element={<SplitPdfTool darkMode={darkMode} />} />
              <Route path="/gemini-watermark-remover" element={<GeminiWatermarkRemover darkMode={darkMode} />} />
              
              <Route path="/blog/:slug" element={<BlogArticle darkMode={darkMode} />} />

              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              
              <Route path="/" element={
                <>
                  <SEO
                    title="Smart Student Tools (Smart Studies) - Free Academic Calculators, PDF & AI Tools"
                    description="Ace your academics with free, modern tools: CGPA to Percentage Converter, 75% Attendance Tracker, Grade Calculator, PDF Merge/Unlock, OCR, and Study Planner."
                    url="https://smartstudenttools.xyz/"
                    jsonLd={[
                      {
                        '@context': 'https://schema.org',
                        '@type': 'WebSite',
                        'name': 'Smart Student Tools',
                        'alternateName': 'Smart Studies',
                        'url': 'https://smartstudenttools.xyz/',
                        'publisher': {
                          '@type': 'Organization',
                          'name': 'Smart Student Tools'
                        }
                      },
                      {
                        '@context': 'https://schema.org',
                        '@type': 'WebPage',
                        'name': 'Smart Student Tools (Smart Studies) - Free Online Academic Tools',
                        'description': 'Free modern academic tools: CGPA to Percentage Converter, 75% Attendance Tracker, Grade Calculator, PDF Merge/Unlock, OCR, and Study Planner.',
                        'url': 'https://smartstudenttools.xyz/'
                      }
                    ]}
                  />
                  {/* Hero Section */}
                  <section className={`relative ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-blue-600 to-purple-600'} text-white py-10 px-4 overflow-hidden`}>
                    <div className="absolute inset-0 z-0 opacity-10">
                      {/* Academic Icons */}
                      <Icon name="Book" className="absolute top-1/4 left-1/4 w-24 h-24 rotate-12" />
                      <Icon name="Calculator" className="absolute bottom-1/3 right-1/4 w-20 h-20 -rotate-6" />
                      <Icon name="GraduationCap" className="absolute top-1/2 left-1/2 w-28 h-28 transform -translate-x-1/2 -translate-y-1/2 rotate-3" />
                      <Icon name="TrendingUp" className="absolute top-1/4 right-1/3 w-20 h-20 rotate-45" />
                      <Icon name="Calendar" className="absolute bottom-1/4 left-1/3 w-22 h-22 -rotate-12" />
                    </div>
                    <div className="container mx-auto text-center relative z-10">
                      <h1 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">
                        Ace Your Academics with Smart Tools
                      </h1>
                      <p className="text-sm md:text-base max-w-xl mx-auto opacity-90">
                        Convert, calculate, and conquer college with our all-in-one platform.
                      </p>
                    </div>
                  </section>

                  {/* Main Dashboard Area */}
                  <main className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4 md:px-8`}>
                    <div className="container mx-auto max-w-5xl">
                      <div className="mb-10 text-center md:text-left">
                        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Academic Dashboards
                        </h2>
                        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Select an academic module below to track, predict, and manage your student workflow.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tools.map((tool) => (
                          <Link
                            key={tool.id}
                            to={tool.path}
                            className={`group block p-6 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
                              darkMode
                                ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
                                : 'bg-white border-gray-200 hover:border-blue-400'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`p-3 rounded-xl transition-colors duration-200 ${
                                darkMode ? 'bg-blue-900/30 text-blue-400 group-hover:bg-blue-800/40' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100/70'
                              }`}>
                                <Icon name={tool.icon} className="w-6 h-6" />
                              </div>
                              <h3 className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {tool.title}
                              </h3>
                            </div>
                            <p className={`text-xs mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {tool.description}
                            </p>
                            <div className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                              <span>Open Dashboard</span>
                              <svg className="w-4 h-4 ml-1 transition-transform duration-200 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Image Tools Section */}
                      <div className="mt-14">
                        <div className="mb-8 text-center md:text-left">
                          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Image Tools
                          </h2>
                          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Browser-based image tools — no uploads to any server, everything runs locally.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {imageTools.map((tool) => {
                            const accentMap = { blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100/70 border-blue-400', violet: 'bg-violet-50 text-violet-600 group-hover:bg-violet-100/70 border-violet-400', emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100/70 border-emerald-400' };
                            const darkAccentMap = { blue: 'bg-blue-900/30 text-blue-400 group-hover:bg-blue-800/40 border-blue-500', violet: 'bg-violet-900/30 text-violet-400 group-hover:bg-violet-800/40 border-violet-500', emerald: 'bg-emerald-900/30 text-emerald-400 group-hover:bg-emerald-800/40 border-emerald-500' };
                            const accent = tool.accent || 'blue';
                            return (
                              <Link
                                key={tool.path}
                                to={tool.path}
                                className={`group block p-6 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
                                  darkMode
                                    ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
                                    : 'bg-white border-gray-200 hover:border-blue-400'
                                }`}
                              >
                                <div className="flex items-center gap-3 mb-4">
                                  <div className={`p-3 rounded-xl transition-colors duration-200 ${
                                    darkMode ? darkAccentMap[accent] : accentMap[accent]
                                  }`}>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <rect x="3" y="3" width="18" height="18" rx="2" />
                                      <circle cx="8.5" cy="8.5" r="1.5" />
                                      <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </div>
                                  <h3 className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {tool.label}
                                  </h3>
                                </div>
                                <p className={`text-xs mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {tool.description}
                                </p>
                                <div className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                                  <span>Open Tool</span>
                                  <svg className="w-4 h-4 ml-1 transition-transform duration-200 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                      {/* PDF Tools Section */}
                      <div className="mt-14">
                        <div className="mb-8 text-center md:text-left">
                          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            PDF Tools
                          </h2>
                          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Optimize, compress, and edit PDF documents locally in your browser for absolute privacy.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {pdfTools.map((tool) => {
                            const accentMap = { red: 'bg-red-50 text-red-650 group-hover:bg-red-100/70 border-red-400' };
                            const darkAccentMap = { red: 'bg-red-900/30 text-red-400 group-hover:bg-red-800/40 border-red-500' };
                            const accent = tool.accent || 'red';
                            return (
                              <Link
                                key={tool.path}
                                to={tool.path}
                                className={`group block p-6 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
                                  darkMode
                                    ? 'bg-gray-800 border-gray-700 hover:border-red-550'
                                    : 'bg-white border-gray-200 hover:border-red-400'
                                }`}
                              >
                                <div className="flex items-center gap-3 mb-4">
                                  <div className={`p-3 rounded-xl transition-colors duration-200 ${
                                    darkMode ? darkAccentMap[accent] : accentMap[accent]
                                  }`}>
                                    <Icon name={tool.icon} className="w-6 h-6" />
                                  </div>
                                  <h3 className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {tool.label}
                                  </h3>
                                </div>
                                <p className={`text-xs mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {tool.description}
                                </p>
                                <div className="flex items-center text-sm font-semibold text-red-600 dark:text-red-400">
                                  <span>Open Tool</span>
                                  <svg className="w-4 h-4 ml-1 transition-transform duration-200 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                      {/* AI Tools Section */}
                      <div className="mt-14">
                        <div className="mb-8 text-center md:text-left">
                          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            AI Tools
                          </h2>
                          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Intelligent, client-side tools running local mathematical pixel algorithms.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {aiTools.map((tool) => {
                            const accentMap = { blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100/70 border-blue-400' };
                            const darkAccentMap = { blue: 'bg-blue-900/30 text-blue-400 group-hover:bg-blue-800/40 border-blue-500' };
                            const accent = tool.accent || 'blue';
                            return (
                              <Link
                                key={tool.path}
                                to={tool.path}
                                className={`group block p-6 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
                                  darkMode
                                    ? 'bg-gray-800 border-gray-700 hover:border-blue-550'
                                    : 'bg-white border-gray-200 hover:border-blue-400'
                                  }`}
                              >
                                <div className="flex items-center gap-3 mb-4">
                                  <div className={`p-3 rounded-xl transition-colors duration-200 ${
                                    darkMode ? darkAccentMap[accent] : accentMap[accent]
                                  }`}>
                                    <Icon name={tool.icon} className="w-6 h-6" />
                                  </div>
                                  <h3 className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {tool.label}
                                  </h3>
                                </div>
                                <p className={`text-xs mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {tool.description}
                                </p>
                                <div className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                                  <span>Open Tool</span>
                                  <svg className="w-4 h-4 ml-1 transition-transform duration-200 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                      <AdsterraBanner />
                    </div>
                  </main>
                </>
              } />
            </Routes>
          </Suspense>
        </div>

        {/* Features Banner */}
        <section className="bg-gradient-to-r from-teal-500 to-green-500 text-white py-12 px-4">
          <div className="container mx-auto flex flex-wrap justify-around items-center text-center gap-8">
            <div className="flex flex-col items-center flex-1 min-w-[150px] max-w-[200px] p-4 rounded-lg bg-teal-600 bg-opacity-30 backdrop-blur-sm">
              <Icon name="Smartphone" className="w-12 h-12 mb-3" />
              <h4 className="font-semibold text-lg">Mobile Friendly</h4>
            </div>
            <div className="flex flex-col items-center flex-1 min-w-[150px] max-w-[200px] p-4 rounded-lg bg-teal-600 bg-opacity-30 backdrop-blur-sm">
              <Icon name="Zap" className="w-12 h-12 mb-3" />
              <h4 className="font-semibold text-lg">Fast &amp; Lightweight</h4>
            </div>
            <div className="flex flex-col items-center flex-1 min-w-[150px] max-w-[200px] p-4 rounded-lg bg-teal-600 bg-opacity-30 backdrop-blur-sm">
              <Icon name="DollarSign" className="w-12 h-12 mb-3" />
              <h4 className="font-semibold text-lg">Free to Use</h4>
            </div>
            <div className="flex flex-col items-center flex-1 min-w-[150px] max-w-[200px] p-4 rounded-lg bg-teal-600 bg-opacity-30 backdrop-blur-sm">
              <Icon name="UserX" className="w-12 h-12 mb-3" />
              <h4 className="font-semibold text-lg">No Login Required</h4>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full text-center py-6 text-xs text-gray-500 dark:text-gray-400">
          <Link to="/about" className="underline text-blue-800 hover:text-blue-900 dark:text-blue-300 dark:hover:text-white mr-4">About</Link>
          <Link to="/contact" className="underline text-blue-800 hover:text-blue-900 dark:text-blue-300 dark:hover:text-white mr-4">Contact</Link>
          <Link to="/privacy-policy" className="underline text-blue-800 hover:text-blue-900 dark:text-blue-300 dark:hover:text-white mr-4">Privacy Policy</Link>
          <Link to="/terms-conditions" className="underline text-blue-800 hover:text-blue-900 dark:text-blue-300 dark:hover:text-white">Terms &amp; Conditions</Link>
        </footer>
        <Analytics />
      </div>
    </div>
  );
};
export default App;
