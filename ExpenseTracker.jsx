import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import CalculationHistory from './CalculationHistory.jsx';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import AdsterraBanner from './AdsterraBanner';
import SEO from './SEO';

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
  const [rating, setRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

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
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
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
    <>
      <SEO
        title="Expense Tracker - Smart Student Tools"
        description="Track your expenses, manage your budget, and visualize your spending. Free, private, and easy to use."
        url="https://smartstudenttools.xyz/expense-tracker"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': 'Expense Tracker',
          'description': 'Track your expenses, manage your budget, and visualize your spending. Free, private, and easy to use.',
          'applicationCategory': 'FinanceApplication',
          'operatingSystem': 'All',
          'url': 'https://smartstudenttools.xyz/expense-tracker',
          'publisher': {
            '@type': 'Organization',
            'name': 'Smart Student Tools'
          }
        }}
      />
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

        {/* Structured Content Section */}
        <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8 text-gray-800 dark:text-gray-200">
          
          {/* About budgeting */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold">📘 About Student Budgeting &amp; Expenses</h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Maintaining positive cash flow while attending college can be a challenge. With expenses spread across food, books, bills, transportation, and leisure, it is easy to overspend. An Expense Tracker helps students visualising their spending distribution, identify areas of waste, and allocate monthly allowances more responsibly. By keeping an active ledger of your daily transactions, you build solid financial habits for the future.
            </p>
          </div>

          {/* How to Use Section */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold">📖 How to Use the Expense Tracker</h3>
            <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li>Enter your monthly starting budget or allowance in the budget input block.</li>
              <li>Input details of a new transaction: enter the amount, write a description, and select a category (e.g. Food, Bills, Shopping).</li>
              <li>Click **Add Transaction** to record the item in the ledger list.</li>
              <li>Observe the circular visual chart to see which category eats up the largest chunk of your cash.</li>
              <li>Filter entries by period (This Week, This Month, or All Time) using the filter selector.</li>
            </ol>
          </div>

          {/* Formulas Section */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold">📊 Budgeting Balance Formulas</h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              The tracker monitors your financial health using simple mathematical subtraction:
              <br />
              <code className="block my-2 bg-gray-100 dark:bg-gray-950 p-2 rounded font-mono text-center">
                Total Expenses = Sum of all added transaction amounts
                <br />
                Remaining Balance = Monthly Starting Budget - Total Expenses
              </code>
            </p>
          </div>

          {/* Practical Example */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold">✏️ Detailed Budget Case Study</h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Imagine you receive a monthly allowance of ₹8,000. During the first week of the month, you log the following entries:
              <br />
              - Hostel Mess Bill (Category: Bills) = ₹3,000
              <br />
              - Textbooks (Category: Other) = ₹1,200
              <br />
              - Weekend Dinner (Category: Food) = ₹800
              <br />
              - Bus Ticket (Category: Travel) = ₹200
              <br />
              - **Total Expenses:** 3000 + 1200 + 800 + 200 = ₹5,200
              <br />
              - **Remaining Pocket Balance:** 8000 - 5200 = ₹2,800. The visual pie chart will display that Bills constitute 57.7% of your total spend.
            </p>
          </div>

          {/* Advantages Section */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold">🌟 Advantages of our Expense Tracker</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li><span className="font-semibold text-gray-950 dark:text-white">Interactive Chart:</span> View category percentages dynamically without manual math.</li>
              <li><span className="font-semibold text-gray-950 dark:text-white">Zero Data Loss:</span> Transactions are stored in local storage so your data remains intact across sessions.</li>
              <li><span className="font-semibold text-gray-950 dark:text-white">Time Filters:</span> Switch between weekly, monthly, and absolute scopes to track spend speed.</li>
            </ul>
          </div>

          {/* FAQs Section */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold">❓ Frequently Asked Questions</h3>
            <div className="space-y-3">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                <button
                  className="w-full flex justify-between items-center text-left font-semibold text-base py-2 focus:outline-none"
                  onClick={(e) => {
                    const content = e.currentTarget.nextElementSibling;
                    const icon = e.currentTarget.querySelector('.accordion-icon');
                    if (content.style.maxHeight) {
                      content.style.maxHeight = null;
                      icon.style.transform = 'rotate(0deg)';
                    } else {
                      content.style.maxHeight = content.scrollHeight + 'px';
                      icon.style.transform = 'rotate(45deg)';
                    }
                  }}
                >
                  <span>Are my expense logs uploaded to a remote database?</span>
                  <span className="accordion-icon text-xl transition-transform duration-300">+</span>
                </button>
                <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm text-gray-600 dark:text-gray-300">
                  <p className="pt-2">No. This tool operates 100% client-side. Your budget values and transaction items are stored strictly inside your browser's LocalStorage, maintaining high privacy.</p>
                </div>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                <button
                  className="w-full flex justify-between items-center text-left font-semibold text-base py-2 focus:outline-none"
                  onClick={(e) => {
                    const content = e.currentTarget.nextElementSibling;
                    const icon = e.currentTarget.querySelector('.accordion-icon');
                    if (content.style.maxHeight) {
                      content.style.maxHeight = null;
                      icon.style.transform = 'rotate(0deg)';
                    } else {
                      content.style.maxHeight = content.scrollHeight + 'px';
                      icon.style.transform = 'rotate(45deg)';
                    }
                  }}
                >
                  <span>What is the 50/30/20 budgeting rule?</span>
                  <span className="accordion-icon text-xl transition-transform duration-300">+</span>
                </button>
                <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm text-gray-600 dark:text-gray-300">
                  <p className="pt-2">It is a simple budgeting guideline: allocate 50% of your income/allowance to Needs (bills, groceries), 30% to Wants (entertainment, dining out), and save the remaining 20%.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Tools & Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h4 className="font-bold text-lg mb-3">🛠️ Related Utility Tools</h4>
              <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                <li><Link to="/printing-cost-calculator" className="hover:underline">Printing Cost Calculator</Link></li>
                <li><Link to="/gst-calculator" className="hover:underline">GST Calculator</Link></li>
                <li><Link to="/financial-calculator" className="hover:underline">Financial Calculator</Link></li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h4 className="font-bold text-lg mb-3">📚 Related Articles</h4>
              <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                <li><Link to="/blog/student-budgeting-financial-literacy-guide" className="hover:underline">The Ultimate Student Budgeting &amp; Financial Literacy Guide</Link></li>
                <li><a href="https://smartstudenttools.xyz/blog/understanding-micro-expenses" target="_blank" rel="noopener noreferrer" className="hover:underline">How Micro-Expenses Quietly Drain Student Budgets</a></li>
              </ul>
            </div>
          </div>

          {/* Interactive Rating Component */}
          <div className="p-6 rounded-xl border shadow-sm text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Rate &amp; Give Feedback</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Help us improve the budgeting experience</p>
            {ratingSubmitted ? (
              <p className="text-green-600 font-semibold">Thank you for your rating of {rating} stars!</p>
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
          </div>

        </div>
        <AdsterraBanner />
      </div>
    </>
  );
};

export default ExpenseTracker; 
