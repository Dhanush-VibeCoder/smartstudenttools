import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import StandardCalculator from './StandardCalculator';
import PercentageCalculator from './PercentageCalculator';
import UnitConverter from './UnitConverter';
import GPAConverterTool from './GPAConverterTool';
import BMI_Calculator from './BMI_Calculator';
import './index.css';

const TOOLS = [
  { key: 'standard', label: 'Standard', icon: '🧮', component: (props) => <StandardCalculator {...props} popup={true} /> },
  { key: 'percentage', label: 'Percent', icon: '％', component: (props) => <PercentageCalculator {...props} popup={true} /> },
  { key: 'unit', label: 'Units', icon: '🔄', component: (props) => <UnitConverter {...props} popup={true} /> },
  { key: 'gpa', label: 'CGPA', icon: '🎓', component: (props) => <GPAConverterTool {...props} popup={true} /> },
  { key: 'bmi', label: 'BMI', icon: '⚖️', component: (props) => <BMI_Calculator {...props} popup={true} /> },
];

function PopupApp() {
  const [tool, setTool] = useState('standard');
  const ToolComponent = TOOLS.find(t => t.key === tool).component;

  return (
    <div className="w-[360px] min-h-[500px] bg-white dark:bg-gray-900 rounded-xl shadow-lg p-0 font-inter flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-600 to-teal-500 rounded-t-xl">
        <img src="logo.png" alt="Logo" className="w-8 h-8 rounded shadow" />
        <span className="text-lg font-bold text-white tracking-wide">Smart Student Tools</span>
      </header>
      {/* Tab Navigation */}
      <nav className="flex gap-1 px-2 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
        {TOOLS.map(t => (
          <button
            key={t.key}
            className={`flex-1 flex flex-col items-center px-1 py-1 rounded-lg text-xs font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${tool === t.key ? 'bg-blue-700 text-white shadow' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}
            onClick={() => setTool(t.key)}
            aria-label={t.label + ' Calculator'}
          >
            <span className="text-lg mb-0.5">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
      {/* Main Content */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-b-lg p-3 shadow-inner min-h-[340px] overflow-y-auto">
        <ToolComponent />
      </div>
      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
        <div className="mb-1 text-gray-500 dark:text-gray-300">
          Want more calculators? <br />
          <span className="font-semibold">Explore them in the full web app!</span>
        </div>
        <a href="https://smartstudenttools.xyz" target="_blank" rel="noopener noreferrer" className="underline text-blue-600 dark:text-blue-300">Open Full App</a>
        <div className="mt-1">© {new Date().getFullYear()} Smart Student Tools</div>
      </footer>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<PopupApp />); 