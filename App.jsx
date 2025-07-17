import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import PrivacyPolicy from './PrivacyPolicy';
import About from './About';
import Contact from './Contact';
import AdBanner from './AdBanner';
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


const GPAConverterTool = lazy(() => import('./GPAConverterTool.jsx'));
const AttendanceTracker = lazy(() => import('./AttendanceTracker.jsx'));
const GradeCalculator = lazy(() => import('./GradeCalculator.jsx'));
const BacklogTracker = lazy(() => import('./BacklogTracker.jsx'));
const StudyPlanner = lazy(() => import('./StudyPlanner.jsx'));
const ExamScorePredictor = lazy(() => import('./ExamScorePredictor.jsx'));
const BranchPredictor = lazy(() => import('./BranchPredictor.jsx'));


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

// Header component that uses useLocation
const AppHeader = ({ darkMode, toggleDarkMode, dropdownOpen, setDropdownOpen, tools }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  return (
    <header className={`${darkMode ? 'bg-gray-800' : 'bg-blue-700'} text-white p-4 shadow-md sticky top-0 z-50`}>
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center rounded-lg py-2 px-4">
        <div className="text-2xl font-bold mb-2 sm:mb-0 flex items-center flex-col items-start sm:flex-row sm:items-center">
          <div className="flex items-center">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-full mr-3 bg-white shadow" />
            <span>Smart Student Tools</span>
          </div>
          <span className="text-base font-light opacity-80 mt-1 sm:ml-4 sm:mt-0">Your all-in-one academic assistant</span>
        </div>
        <nav className="flex flex-wrap justify-center sm:justify-end gap-3 sm:gap-4 relative">
          {isHome ? (
            // Show all tool buttons on home page
            <>
              {tools.map(tool => (
                <a
                  key={`nav-${tool.id}`}
                  href={`#${tool.id}`}
                  onClick={(e) => { e.preventDefault(); document.getElementById(tool.id)?.scrollIntoView({ behavior: 'smooth' }); }}
                  className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-800 hover:bg-blue-900'} px-3 py-1 rounded-lg text-sm transition-colors duration-200`}
                >
                  {tool.title.split(' ')[0]}
                </a>
              ))}
              {/* Dropdown for Calculators */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((open) => !open)}
                  className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-800 hover:bg-blue-900'} px-3 py-1 rounded-lg text-sm font-semibold transition-colors duration-200 focus:outline-none`}
                >
                  Calculators ▼
                </button>
                {dropdownOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50`}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <Link to="/calculator" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-t-lg" onClick={() => setDropdownOpen(false)}>Standard Calculator</Link>
                    <Link to="/gpa-converter" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100" onClick={() => setDropdownOpen(false)}>CGPA Converter</Link>
                    <Link to="/percentage-calculator" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100" onClick={() => setDropdownOpen(false)}>Percentage Calculator</Link>
                    <Link to="/gst-calculator" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100" onClick={() => setDropdownOpen(false)}>GST Calculator</Link>
                    <Link to="/printing-cost-calculator" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100" onClick={() => setDropdownOpen(false)}>Printing Cost Calculator</Link>
                    <Link to="/expense-tracker" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100" onClick={() => setDropdownOpen(false)}>Expense Tracker</Link>
                    <Link to="/scientific-calculator" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100" onClick={() => setDropdownOpen(false)}>Scientific Calculator</Link>
                    <Link to="/financial-calculator" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100" onClick={() => setDropdownOpen(false)}>Financial Calculator</Link>
                    <Link to="/currency-converter" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100" onClick={() => setDropdownOpen(false)}>Currency Converter</Link>
                    <Link to="/bmi-calculator" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100" onClick={() => setDropdownOpen(false)}>BMI Calculator</Link>
                    <Link to="/unit-converter" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-b-lg" onClick={() => setDropdownOpen(false)}>Unit Converter</Link>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Show Home button and Calculators dropdown on other pages
            <>
              <Link
                to="/"
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-800 hover:bg-blue-900'} px-3 py-1 rounded-lg text-sm font-semibold transition-colors duration-200 focus:outline-none`}
              >
                Home
              </Link>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((open) => !open)}
                  className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-800 hover:bg-blue-900'} px-3 py-1 rounded-lg text-sm font-semibold transition-colors duration-200 focus:outline-none`}
                >
                  Calculators ▼
                </button>
                {dropdownOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50`}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <Link to="/calculator" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-t-lg" onClick={() => setDropdownOpen(false)}>Standard Calculator</Link>
                    <Link to="/gpa-converter" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100" onClick={() => setDropdownOpen(false)}>CGPA Converter</Link>
                    <Link to="/percentage-calculator" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100" onClick={() => setDropdownOpen(false)}>Percentage Calculator</Link>
                    <Link to="/gst-calculator" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100" onClick={() => setDropdownOpen(false)}>GST Calculator</Link>
                    <Link to="/printing-cost-calculator" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100" onClick={() => setDropdownOpen(false)}>Printing Cost Calculator</Link>
                    <Link to="/expense-tracker" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100" onClick={() => setDropdownOpen(false)}>Expense Tracker</Link>
                    <Link to="/scientific-calculator" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100" onClick={() => setDropdownOpen(false)}>Scientific Calculator</Link>
                    <Link to="/financial-calculator" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100" onClick={() => setDropdownOpen(false)}>Financial Calculator</Link>
                    <Link to="/currency-converter" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100" onClick={() => setDropdownOpen(false)}>Currency Converter</Link>
                    <Link to="/bmi-calculator" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100" onClick={() => setDropdownOpen(false)}>BMI Calculator</Link>
                    <Link to="/unit-converter" className="block px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-b-lg" onClick={() => setDropdownOpen(false)}>Unit Converter</Link>
                  </div>
                )}
              </div>
            </>
          )}
          <button
            onClick={toggleDarkMode}
            className={`ml-2 px-3 py-1 rounded-lg text-sm font-semibold transition-colors duration-200 focus:outline-none ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-800 hover:bg-blue-900'}`}
            title="Toggle dark mode"
          >
            {darkMode ? '🌙' : '☀️'}
          </button>
        </nav>
      </div>
    </header>
  );
};

// Main App component for the Smart Student Tools home page
const App = () => {
  const [darkMode, setDarkMode] = useState(false); // Dark mode state
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const tools = [
    {
      id: 'cgpa-converter',
      icon: 'GraduationCap',
      title: 'CGPA to Percentage Converter',
      description: 'Convert your CGPA into percentage for various needs.',
      component: GPAConverterTool,
    },
    {
      id: 'attendance-tracker',
      icon: 'Users',
      title: 'Attendance Tracker',
      description: 'Track and manage your class attendance easily.',
      component: AttendanceTracker,
    },
    {
      id: 'grade-calculator',
      icon: 'ChartBar',
      title: 'Grade Calculator',
      description: 'Calculate your subject-wise grades and overall CGPA.',
      component: GradeCalculator,
    },
    {
      id: 'backlog-tracker',
      icon: 'ClipboardList',
      title: 'Backlog Tracker',
      description: 'Keep tabs on your pending academic tasks and visualize progress.',
      component: BacklogTracker,
    },
    {
      id: 'study-planner',
      icon: 'Edit3',
      title: 'Study Planner',
      description: 'Organize your study schedule for optimal results.',
      component: StudyPlanner,
    },
    {
      id: 'exam-score-predictor',
      icon: 'Search',
      title: 'Exam Score Predictor',
      description: 'Predict your potential exam scores based on performance.',
      component: ExamScorePredictor,
    },
    {
      id: 'college-branch-predictor',
      icon: 'Compass',
      title: 'College Branch Predictor',
      description: 'Get insights into potential college branches based on your exam performance.',
      component: BranchPredictor,
    },
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
    <BrowserRouter>
      <AppHeader
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        tools={tools}
      />
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
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/" element={
          <>
            {/* Hero Section */}
            <section className={`relative ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-blue-600 to-purple-600'} text-white py-20 px-4 overflow-hidden`}>
              <div className="absolute inset-0 z-0 opacity-10">
                {/* Academic Icons (using simple SVG for illustration, could be more complex SVGs or background images) */}
                <Icon name="Book" className="absolute top-1/4 left-1/4 w-24 h-24 rotate-12" />
                <Icon name="Calculator" className="absolute bottom-1/3 right-1/4 w-20 h-20 -rotate-6" />
                <Icon name="GraduationCap" className="absolute top-1/2 left-1/2 w-28 h-28 transform -translate-x-1/2 -translate-y-1/2 rotate-3" />
                <Icon name="TrendingUp" className="absolute top-1/4 right-1/3 w-20 h-20 rotate-45" />
                <Icon name="Calendar" className="absolute bottom-1/4 left-1/3 w-22 h-22 -rotate-12" />
              </div>
              <div className="container mx-auto text-center relative z-10">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                  Ace Your Academics with Smart Tools
                </h1>
                <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
                  Convert, calculate, and conquer college with our all-in-one platform.
                </p>
                <a href="#cgpa-converter" onClick={(e) => { e.preventDefault(); scrollToSection('cgpa-converter'); }} className="inline-block bg-white text-blue-800 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
                  Explore Tools
                </a>
              </div>
            </section>

            {/* Main Tools Content Area */}
            <main className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-16 px-4`}>
              <div className="container mx-auto space-y-16">
                {tools.map((tool, idx) => (
                  <React.Fragment key={tool.id}>
                    <section
                      id={tool.id}
                      className={`py-8 px-4 rounded-3xl shadow-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    >
                      {/* Render the specific tool component */}
                      <Suspense fallback={<div>Loading...</div>}>
                        <tool.component darkMode={darkMode} />
                      </Suspense>

                      {/* Related Tools CTA Block */}
                      <div className={`mt-12 p-6 rounded-xl shadow-inner text-center space-y-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                        <h3 className={`font-bold text-xl ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                          Explore Other Smart Tools
                        </h3>
                        <div className="flex flex-wrap justify-center gap-4">
                          {tools.filter(t => t.id !== tool.id).map(relatedTool => (
                            <a
                              key={`related-${relatedTool.id}`}
                              href={`#${relatedTool.id}`}
                              onClick={(e) => { e.preventDefault(); scrollToSection(relatedTool.id); }}
                              className={`flex items-center justify-center px-5 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-blue-700 hover:bg-blue-800 text-white' : 'bg-blue-800 hover:bg-blue-900 text-white'}`}
                            >
                              <Icon name={relatedTool.icon} className="w-5 h-5 mr-2" />
                              {relatedTool.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    </section>
                    {idx === 1 && (
                      <div className="my-8 flex justify-center">
                        <AdBanner />
                      </div>
                    )}
                  </React.Fragment>
                ))}
                {/* Ad at the bottom of main content */}
                <div className="my-8 flex justify-center">
                  <AdBanner />
                </div>
              </div>
            </main>
          </>
        } />
      </Routes>

      {/* Features Banner (remains the same) */}
      <section className="bg-gradient-to-r from-teal-500 to-green-500 text-white py-12 px-4">
        <div className="container mx-auto flex flex-wrap justify-around items-center text-center gap-8">
          <div className="flex flex-col items-center flex-1 min-w-[150px] max-w-[200px] p-4 rounded-lg bg-teal-600 bg-opacity-30 backdrop-blur-sm">
            <Icon name="Smartphone" className="w-12 h-12 mb-3" />
            <h4 className="font-semibold text-lg">Mobile Friendly</h4>
          </div>
          <div className="flex flex-col items-center flex-1 min-w-[150px] max-w-[200px] p-4 rounded-lg bg-teal-600 bg-opacity-30 backdrop-blur-sm">
            <Icon name="Zap" className="w-12 h-12 mb-3" />
            <h4 className="font-semibold text-lg">Fast & Lightweight</h4>
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

      {/* Footer with Privacy Policy link */}
      <footer className="w-full text-center py-6 text-xs text-gray-500 dark:text-gray-400">
        <Link to="/about" className="underline text-blue-800 hover:text-blue-900 dark:text-blue-300 dark:hover:text-white mr-4">About</Link>
        <Link to="/contact" className="underline text-blue-800 hover:text-blue-900 dark:text-blue-300 dark:hover:text-white mr-4">Contact</Link>
        <Link to="/privacy-policy" className="underline text-blue-800 hover:text-blue-900 dark:text-blue-300 dark:hover:text-white">Privacy Policy</Link>
      </footer>
      <Analytics />
    </BrowserRouter>
  );
};
export default App;
