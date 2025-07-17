import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CalculationHistory from './CalculationHistory.jsx';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import AdBanner from './AdBanner.jsx';

const EXPENSE_HISTORY_KEY = 'expense_tracker_history';
const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Other'];
const PERIODS = ['This Month', 'This Week', 'All Time'];

function getPeriodRange(period) {
  const now = new Date();
  if (period === 'This Month') {
    return [new Date(now.getFullYear(), now.getMonth(), 1), now];
  } else if (period === 'This Week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    return [new Date(now.setDate(diff)), new Date()];
  }
  return [null, null]; // All Time
}

const ExpenseTracker = ({ darkMode }) => {
  const [amount, setAmount] = useState('');
  const [annotation, setAnnotation] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(null);
  const [period, setPeriod] = useState('This Month');
  const resultRef = useRef(null);
  const pieChartRef = useRef(null);

  // Save calculation to history
  const saveToHistory = (entries) => {
    const newEntry = {
      id: Date.now(),
      entries,
      date: new Date().toISOString(),
    };
    let history = [];
    try {
      const stored = localStorage.getItem(EXPENSE_HISTORY_KEY);
      if (stored) history = JSON.parse(stored);
    } catch {}
    history.unshift(newEntry);
    if (history.length > 50) history = history.slice(0, 50);
    localStorage.setItem(EXPENSE_HISTORY_KEY, JSON.stringify(history));
  };

  const handleAddEntry = () => {
    setError('');
    if (!amount || isNaN(parseFloat(amount))) {
      setError('Please enter a valid amount.');
      return;
    }
    setEntries(prev => [
      { amount: parseFloat(amount), annotation: annotation.trim(), category, id: Date.now(), date: new Date().toISOString() },
      ...prev
    ]);
    setAmount('');
    setAnnotation('');
    setCategory(CATEGORIES[0]);
    setCopied(false);
    setFeedbackGiven(null);
  };

  // Filter entries by selected period
  const filteredEntries = React.useMemo(() => {
    if (period === 'All Time') return entries;
    const [start, end] = getPeriodRange(period);
    return entries.filter(e => {
      const d = new Date(e.date);
      return (!start || d >= start) && (!end || d <= end);
    });
  }, [entries, period]);

  // Pie chart data
  const pieData = React.useMemo(() => {
    const sums = {};
    CATEGORIES.forEach(cat => (sums[cat] = 0));
    filteredEntries.forEach(e => {
      sums[e.category] = (sums[e.category] || 0) + (e.amount || 0);
    });
    return {
      labels: CATEGORIES,
      datasets: [
        {
          data: CATEGORIES.map(cat => sums[cat]),
          backgroundColor: [
            '#60a5fa', '#fbbf24', '#34d399', '#f87171', '#a78bfa', '#6b7280'
          ],
        },
      ],
    };
  }, [filteredEntries]);

  const handleSubtotal = () => {
    if (filteredEntries.length === 0) return 0;
    return filteredEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
  };

  const handleTotal = () => {
    const total = handleSubtotal();
    saveToHistory(filteredEntries);
    setCopied(false);
    setFeedbackGiven(null);
    return total;
  };

  const handleCopy = () => {
    if (filteredEntries.length === 0) return;
    const text = filteredEntries.map(e => `${e.annotation ? e.annotation + ': ' : ''}${e.amount} (${e.category})`).join('\n') + `\nTotal: ${handleSubtotal()}`;
    navigator.clipboard.writeText(text).then(() => setCopied(true));
  };

  const handleExportPdf = async () => {
    if (filteredEntries.length === 0) {
      alert('No entries to export.');
      return;
    }
    try {
      const now = new Date();
      const dateStr = now.toLocaleString();
      // Get chart image
      let chartImg = null;
      if (pieChartRef.current && pieChartRef.current.canvas) {
        chartImg = pieChartRef.current.canvas.toDataURL('image/png');
      } else {
        // fallback: try to find the canvas in DOM
        const chartCanvas = document.querySelector('canvas');
        if (chartCanvas) chartImg = chartCanvas.toDataURL('image/png');
      }
      // Create a temporary element for PDF content (table only)
      const pdfContent = document.createElement('div');
      pdfContent.style.padding = '32px';
      pdfContent.style.fontFamily = 'Inter,sans-serif';
      pdfContent.style.color = darkMode ? '#f3f4f6' : '#222';
      pdfContent.innerHTML = `
        <h1 style=\"text-align:center; color:#2563eb; margin-bottom:8px;\">Smart Student Tools</h1>
        <h2 style=\"text-align:center; margin-bottom:24px;\">Expense Tracker Report</h2>
        <div style=\"text-align:right; font-size:12px; color:#888; margin-bottom:16px;\">
          Generated: ${dateStr}
        </div>
        <div style=\"margin-bottom:16px;\"><b>Period:</b> ${period}</div>
        <table style=\"width:100%; border-collapse:collapse; margin-bottom:24px;\">
          <thead>
            <tr style=\"background:${darkMode ? '#374151' : '#f3f4f6'};\">
              <th style=\"padding:8px; border:1px solid #ddd;\">#</th>
              <th style=\"padding:8px; border:1px solid #ddd;\">Category</th>
              <th style=\"padding:8px; border:1px solid #ddd;\">Annotation</th>
              <th style=\"padding:8px; border:1px solid #ddd; text-align:right;\">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${filteredEntries.slice().reverse().map((e, i) => `
              <tr>
                <td style='padding:8px; border:1px solid #ddd;'>${i + 1}</td>
                <td style='padding:8px; border:1px solid #ddd;'>${e.category}</td>
                <td style='padding:8px; border:1px solid #ddd;'>${e.annotation || '(no note)'}</td>
                <td style='padding:8px; border:1px solid #ddd; text-align:right;'>${e.amount}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style=\"background:${darkMode ? '#0e7490' : '#e0f2fe'};\">
              <td colspan=\"3\" style=\"padding:8px; border:1px solid #ddd; font-weight:bold; text-align:right;\">Total</td>
              <td style=\"padding:8px; border:1px solid #ddd; font-weight:bold; text-align:right;\">${handleSubtotal()}</td>
            </tr>
          </tfoot>
        </table>
        <div style=\"font-size:12px; color:#888; text-align:center;\">Powered by Smart Student Tools</div>
      `;
      document.body.appendChild(pdfContent);
      const canvas = await html2canvas(pdfContent, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      document.body.removeChild(pdfContent);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      let y = 40;
      // Add chart image above table
      if (chartImg) {
        const chartWidth = pageWidth * 0.25;
        const chartHeight = chartWidth;
        const chartX = (pageWidth - chartWidth) / 2;
        pdf.addImage(chartImg, 'PNG', chartX, y, chartWidth, chartHeight);
        y += chartHeight + 20;
      }
      // Add table image
      const imgWidth = pageWidth * 0.95;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const x = (pageWidth - imgWidth) / 2;
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save('Expense_Tracker_Report.pdf');
    } catch (err) {
      alert('Failed to generate PDF.');
    }
  };

  // Keyboard: Enter triggers add entry
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddEntry();
  };

  return (
    <div className={`p-4 font-inter min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-teal-50 to-blue-100'}`}>
      <div className={`w-full max-w-4xl mx-auto mt-6 mb-4 rounded-2xl shadow-lg p-4 text-3xl font-bold text-center ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-blue-900'}`}>Expense Tracker</div>
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-10 max-w-4xl mx-auto transition hover:shadow-xl hover:scale-[1.02] duration-200 flex flex-col md:flex-row gap-6`}>
        {/* Left: Entries List & Pie Chart */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-gray-50 dark:bg-gray-100 rounded-xl p-4 border border-gray-200 dark:border-gray-200 min-w-[220px] max-h-[400px] overflow-y-auto">
            <div className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-900">Entries</div>
            <div className="divide-y divide-gray-200">
              {filteredEntries.length === 0 ? (
                <div className="text-gray-400 italic text-center py-8">No entries yet.</div>
              ) : (
                filteredEntries.map((e, idx) => (
                  <div key={e.id} className={`flex justify-between items-center py-2 text-lg rounded-lg ${darkMode ? 'bg-gray-800' : ''}`}> 
                    <span className={`font-mono ${darkMode ? 'text-white' : 'text-gray-700'}`}>{e.annotation ? <span className="font-semibold">{e.annotation}</span> : <span className="text-gray-400">(no note)</span>} <span className={`ml-2 px-2 py-1 rounded ${darkMode ? 'bg-blue-800 text-blue-100' : 'bg-blue-100 text-blue-800'} text-xs font-bold`}>{e.category}</span></span>
                    <span className={`font-bold text-xl ${darkMode ? 'text-green-300' : 'text-blue-900'}`}>{e.amount}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Pie Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 flex flex-col items-center">
            <div className="mb-2 text-md font-semibold text-gray-700 dark:text-gray-100">Spending Breakdown</div>
            <Pie ref={pieChartRef} data={pieData} />
          </div>
        </div>
        {/* Right: Input & Actions */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex gap-2 mb-2">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-2 rounded-lg font-semibold border transition-colors duration-150 ${period === p ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter amount"
            className={`w-full py-4 px-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500'} text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400`}
            aria-label="Enter amount"
            autoFocus
          />
          <input
            type="text"
            value={annotation}
            onChange={e => setAnnotation(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add annotation (optional)"
            className={`w-full py-4 px-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500'} text-lg font-normal focus:outline-none focus:ring-2 focus:ring-blue-400`}
            aria-label="Add annotation"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className={`w-full py-3 px-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-200 bg-gray-50 text-gray-900'} text-lg font-normal focus:outline-none focus:ring-2 focus:ring-blue-400`}
            aria-label="Select category"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAddEntry}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-md transition-all text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Add Entry
            </button>
            <button
              onClick={() => {}}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 rounded-lg shadow-md transition-all text-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              tabIndex={0}
            >
              Subtotal: {handleSubtotal()}
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleTotal}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg shadow-md transition-all text-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              Total
            </button>
            <button
              onClick={handleExportPdf}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-lg shadow-md transition-all text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <span className="inline-block align-middle mr-2">&#8681;</span> Export PDF
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCopy}
              className={`flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-lg shadow-md transition-all text-lg focus:outline-none focus:ring-2 focus:ring-teal-400 ${copied ? 'opacity-80' : ''}`}
            >
              {copied ? 'Copied!' : 'Copy All'}
            </button>
            <button
              onClick={() => { setEntries([]); setCopied(false); setFeedbackGiven(null); }}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-4 rounded-lg shadow-md transition-all text-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Clear
            </button>
          </div>
          {/* Feedback Section */}
          <div className="mt-4 flex flex-col items-center">
            <span className={`text-md font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>⭐ Was this helpful?</span>
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => setFeedbackGiven('yes')}
                className={`font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${feedbackGiven === 'yes' ? 'bg-green-500 text-white' : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-green-600' : 'bg-gray-200 text-gray-700 hover:bg-green-100'}`}
                aria-label="Feedback Yes"
              >
                👍
              </button>
              <button
                onClick={() => setFeedbackGiven('no')}
                className={`font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${feedbackGiven === 'no' ? 'bg-red-500 text-white' : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-red-600' : 'bg-gray-200 text-gray-700 hover:bg-red-100'}`}
                aria-label="Feedback No"
              >
                👎
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Calculation History below the tracker */}
      <CalculationHistory historyKey={EXPENSE_HISTORY_KEY} title="Expense Tracker History" darkMode={darkMode} showUniversity={false} showProgress={false} />
      <AdBanner />
    </div>
  );
};

export default ExpenseTracker; 