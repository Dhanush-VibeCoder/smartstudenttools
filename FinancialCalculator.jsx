import React, { useState, useRef } from 'react';
import CalculationHistory from './CalculationHistory.jsx';
import AdBanner from './AdBanner.jsx';
import SEO from './SEO';

const FIN_HISTORY_KEY = 'financial_calc_history';

const FinancialCalculator = ({ darkMode, onToggleDarkMode }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(null);
  const [showTotal, setShowTotal] = useState(false);
  const [lastTotal, setLastTotal] = useState(0);
  const resultRef = useRef(null);
  const [invoice, setInvoice] = useState('');
  const [client, setClient] = useState('');
  const [showTax, setShowTax] = useState(false);
  const [taxPercent, setTaxPercent] = useState('');
  const [showInterest, setShowInterest] = useState(false);
  const [interestType, setInterestType] = useState('simple');
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [emiPrincipal, setEmiPrincipal] = useState('');
  const [emiRate, setEmiRate] = useState('');
  const [emiTenure, setEmiTenure] = useState('');

  // Summary calculations
  const highestEntry = entries.length ? Math.max(...entries.map(e => e.amount)) : 0;
  const lowestEntry = entries.length ? Math.min(...entries.map(e => e.amount)) : 0;
  const averageEntry = entries.length ? (entries.reduce((sum, e) => sum + e.amount, 0) / entries.length).toFixed(2) : 0;
  const totalEntries = entries.length;

  // Tax calculation
  const subtotal = entries.length ? entries.reduce((sum, e) => sum + e.amount, 0) : 0;
  const taxAmount = taxPercent && !isNaN(Number(taxPercent)) ? (subtotal * Number(taxPercent) / 100) : 0;
  const totalWithTax = subtotal + taxAmount;

  // Interest calculation
  let interestResult = 0;
  if (principal && rate && time && !isNaN(principal) && !isNaN(rate) && !isNaN(time)) {
    if (interestType === 'simple') {
      interestResult = (Number(principal) * Number(rate) * Number(time)) / 100;
    } else {
      interestResult = Number(principal) * Math.pow(1 + Number(rate) / 100, Number(time)) - Number(principal);
    }
  }
  // EMI calculation
  let emiResult = 0, totalPayment = 0, totalInterest = 0;
  if (emiPrincipal && emiRate && emiTenure && !isNaN(emiPrincipal) && !isNaN(emiRate) && !isNaN(emiTenure)) {
    const P = Number(emiPrincipal);
    const r = Number(emiRate) / 12 / 100;
    const n = Number(emiTenure) * 12;
    emiResult = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    totalPayment = emiResult * n;
    totalInterest = totalPayment - P;
  }

  // Save calculation to history
  const saveToHistory = (entries) => {
    const newEntry = {
      id: Date.now(),
      entries,
      date: new Date().toISOString(),
    };
    let history = [];
    try {
      const stored = localStorage.getItem(FIN_HISTORY_KEY);
      if (stored) history = JSON.parse(stored);
    } catch {}
    history.unshift(newEntry);
    if (history.length > 50) history = history.slice(0, 50);
    localStorage.setItem(FIN_HISTORY_KEY, JSON.stringify(history));
  };

  const handleAddEntry = () => {
    setError('');
    if (!amount || isNaN(parseFloat(amount))) {
      setError('Please enter a valid amount.');
      return;
    }
    setEntries(prev => [
      { amount: parseFloat(amount), note: note.trim(), invoice: invoice.trim(), client: client.trim(), id: Date.now() },
      ...prev
    ]);
    setAmount('');
    setNote('');
    setInvoice('');
    setClient('');
    setCopied(false);
    setFeedbackGiven(null);
  };

  const handleSubtotal = () => {
    if (entries.length === 0) return 0;
    return entries.reduce((sum, e) => sum + (e.amount || 0), 0);
  };

  const handleTotal = () => {
    const total = handleSubtotal();
    saveToHistory(entries);
    setCopied(false);
    setFeedbackGiven(null);
    setShowTotal(true);
    setLastTotal(total);
    return total;
  };

  const handleCopy = () => {
    if (entries.length === 0) return;
    const text = entries.map(e => `${e.note ? e.note + ': ' : ''}${e.amount}`).join('\n') + `\nTotal: ${handleSubtotal()}`;
    navigator.clipboard.writeText(text).then(() => setCopied(true));
  };

  const handleExportPdf = async () => {
    if (entries.length === 0) {
      alert('No entries to export.');
      return;
    }
    try {
      const now = new Date();
      const dateStr = now.toLocaleString();
      const pdfContent = document.createElement('div');
      pdfContent.style.padding = '32px';
      pdfContent.style.fontFamily = 'Inter,sans-serif';
      pdfContent.style.color = darkMode ? '#f3f4f6' : '#222';
      pdfContent.innerHTML = `
        <h1 style=\"text-align:center; color:#2563eb; margin-bottom:8px;\">Smart Student Tools</h1>
        <h2 style=\"text-align:center; margin-bottom:24px;\">Financial Calculator Report</h2>
        <div style=\"text-align:right; font-size:12px; color:#888; margin-bottom:16px;\">
          Generated: ${dateStr}
        </div>
        <table style=\"width:100%; border-collapse:collapse; margin-bottom:24px;\">
          <thead>
            <tr style=\"background:${darkMode ? '#374151' : '#f3f4f6'};\">
              <th style=\"padding:8px; border:1px solid #ddd;\">#</th>
              <th style=\"padding:8px; border:1px solid #ddd;\">Note</th>
              <th style=\"padding:8px; border:1px solid #ddd; text-align:right;\">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${entries.slice().reverse().map((e, i) => `
              <tr>
                <td style='padding:8px; border:1px solid #ddd;'>${i + 1}</td>
                <td style='padding:8px; border:1px solid #ddd;'>${e.note ? e.note : '(no note)'}</td>
                <td style='padding:8px; border:1px solid #ddd; text-align:right;'>${e.amount}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style=\"background:${darkMode ? '#0e7490' : '#e0f2fe'};\">
              <td colspan=\"2\" style=\"padding:8px; border:1px solid #ddd; font-weight:bold; text-align:right;\">Total</td>
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
      const imgWidth = pageWidth * 0.95;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const x = (pageWidth - imgWidth) / 2;
      const y = 40;
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save('Financial_Calculator_Report.pdf');
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
        title="Financial Calculator - Smart Student Tools"
        description="Calculate interest, EMI, and manage financial records. Free, privacy-first, and easy to use for students."
        url="https://yourdomain.com/financial-calculator"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': 'Financial Calculator',
          'description': 'Calculate interest, EMI, and manage financial records. Free, privacy-first, and easy to use for students.',
          'applicationCategory': 'FinanceApplication',
          'operatingSystem': 'All',
          'url': 'https://yourdomain.com/financial-calculator',
          'publisher': {
            '@type': 'Organization',
            'name': 'Smart Student Tools'
          }
        }}
      />
      <div className={`min-h-screen font-inter ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-teal-50 to-blue-100'}`}> 
        <div className={`w-full max-w-4xl mx-auto mt-6 mb-4 rounded-2xl shadow-lg p-4 text-3xl font-bold text-center ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-blue-900'}`}>Financial Calculator</div>
        {/* Summary Cards */}
        <div className="w-full max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className={`rounded-xl shadow p-4 text-center font-semibold ${darkMode ? 'bg-gray-800 text-blue-200' : 'bg-blue-50 text-blue-900'}`}>
            <div className="text-xs uppercase tracking-wider mb-1">Highest</div>
            <div className="text-2xl">{highestEntry}</div>
          </div>
          <div className={`rounded-xl shadow p-4 text-center font-semibold ${darkMode ? 'bg-gray-800 text-green-200' : 'bg-green-50 text-green-900'}`}>
            <div className="text-xs uppercase tracking-wider mb-1">Lowest</div>
            <div className="text-2xl">{lowestEntry}</div>
          </div>
          <div className={`rounded-xl shadow p-4 text-center font-semibold ${darkMode ? 'bg-gray-800 text-purple-200' : 'bg-purple-50 text-purple-900'}`}>
            <div className="text-xs uppercase tracking-wider mb-1">Average</div>
            <div className="text-2xl">{averageEntry}</div>
          </div>
          <div className={`rounded-xl shadow p-4 text-center font-semibold ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-900'}`}>
            <div className="text-xs uppercase tracking-wider mb-1">Entries</div>
            <div className="text-2xl">{totalEntries}</div>
          </div>
        </div>
        {/* Tax Calculation Card */}
        <div className={`w-full max-w-4xl mx-auto mb-4 rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}> 
          <button
            className={`w-full text-left p-4 text-lg font-bold flex items-center justify-between ${darkMode ? 'text-white' : 'text-blue-900'}`}
            onClick={() => setShowTax(v => !v)}
            aria-expanded={showTax}
          >
            Tax Calculation
            <span className="ml-2">{showTax ? '▲' : '▼'}</span>
          </button>
          {showTax && (
            <div className="p-4 pt-0 flex flex-col gap-2">
              <label className={`block text-sm font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Tax Percentage (%)</label>
              <input
                type="text"
                value={taxPercent}
                onChange={e => setTaxPercent(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="e.g., 18"
                className={`w-full py-3 px-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500'} text-lg font-normal focus:outline-none focus:ring-2 focus:ring-blue-400`}
                aria-label="Tax Percentage"
              />
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <div className={`flex-1 p-3 rounded-lg ${darkMode ? 'bg-gray-900 text-blue-200' : 'bg-blue-50 text-blue-900'}`}>Tax: <span className="font-bold">{taxAmount.toFixed(2)}</span></div>
                <div className={`flex-1 p-3 rounded-lg ${darkMode ? 'bg-gray-900 text-green-200' : 'bg-green-50 text-green-900'}`}>Total with Tax: <span className="font-bold">{totalWithTax.toFixed(2)}</span></div>
              </div>
            </div>
          )}
        </div>
        {/* Interest & Loan/EMI Calculator Card */}
        <div className={`w-full max-w-4xl mx-auto mb-4 rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}> 
          <button
            className={`w-full text-left p-4 text-lg font-bold flex items-center justify-between ${darkMode ? 'text-white' : 'text-blue-900'}`}
            onClick={() => setShowInterest(v => !v)}
            aria-expanded={showInterest}
          >
            Interest & Loan/EMI Calculator
            <span className="ml-2">{showInterest ? '▲' : '▼'}</span>
          </button>
          {showInterest && (
            <div className="p-4 pt-0 flex flex-col gap-6">
              {/* Interest Calculator */}
              <div>
                <div className="mb-2 text-md font-semibold">Interest Calculator</div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={principal}
                    onChange={e => setPrincipal(e.target.value.replace(/[^\d.]/g, ''))}
                    placeholder="Principal"
                    className={`w-full py-2 px-3 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500'} text-base font-normal focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    aria-label="Principal"
                  />
                  <input
                    type="text"
                    value={rate}
                    onChange={e => setRate(e.target.value.replace(/[^\d.]/g, ''))}
                    placeholder="Rate (%)"
                    className={`w-full py-2 px-3 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500'} text-base font-normal focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    aria-label="Rate"
                  />
                  <input
                    type="text"
                    value={time}
                    onChange={e => setTime(e.target.value.replace(/[^\d.]/g, ''))}
                    placeholder="Time (years)"
                    className={`w-full py-2 px-3 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500'} text-base font-normal focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    aria-label="Time"
                  />
                  <select
                    value={interestType}
                    onChange={e => setInterestType(e.target.value)}
                    className={`w-full py-2 px-3 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-200 bg-gray-50 text-gray-900'} text-base font-normal focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    aria-label="Interest Type"
                  >
                    <option value="simple">Simple</option>
                    <option value="compound">Compound</option>
                  </select>
                </div>
                <div className={`p-3 rounded-lg mt-2 ${darkMode ? 'bg-gray-900 text-blue-200' : 'bg-blue-50 text-blue-900'}`}>Interest: <span className="font-bold">{interestResult ? interestResult.toFixed(2) : '--'}</span></div>
              </div>
              {/* EMI Calculator */}
              <div>
                <div className="mb-2 text-md font-semibold">Loan/EMI Calculator</div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={emiPrincipal}
                    onChange={e => setEmiPrincipal(e.target.value.replace(/[^\d.]/g, ''))}
                    placeholder="Principal"
                    className={`w-full py-2 px-3 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500'} text-base font-normal focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    aria-label="EMI Principal"
                  />
                  <input
                    type="text"
                    value={emiRate}
                    onChange={e => setEmiRate(e.target.value.replace(/[^\d.]/g, ''))}
                    placeholder="Rate (%)"
                    className={`w-full py-2 px-3 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500'} text-base font-normal focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    aria-label="EMI Rate"
                  />
                  <input
                    type="text"
                    value={emiTenure}
                    onChange={e => setEmiTenure(e.target.value.replace(/[^\d.]/g, ''))}
                    placeholder="Tenure (years)"
                    className={`w-full py-2 px-3 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500'} text-base font-normal focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    aria-label="EMI Tenure"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <div className={`flex-1 p-3 rounded-lg ${darkMode ? 'bg-gray-900 text-blue-200' : 'bg-blue-50 text-blue-900'}`}>EMI: <span className="font-bold">{emiResult ? emiResult.toFixed(2) : '--'}</span></div>
                  <div className={`flex-1 p-3 rounded-lg ${darkMode ? 'bg-gray-900 text-green-200' : 'bg-green-50 text-green-900'}`}>Total Payment: <span className="font-bold">{totalPayment ? totalPayment.toFixed(2) : '--'}</span></div>
                  <div className={`flex-1 p-3 rounded-lg ${darkMode ? 'bg-gray-900 text-purple-200' : 'bg-purple-50 text-purple-900'}`}>Total Interest: <span className="font-bold">{totalInterest ? totalInterest.toFixed(2) : '--'}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Top Total Bar */}
        <div className={`w-full max-w-4xl mx-auto mt-6 mb-4 rounded-2xl shadow-lg p-4 text-3xl font-bold text-center ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-blue-900'}`}> 
          Total: {handleSubtotal()}
        </div>
        <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-6 items-stretch">
          {/* Left: Entries List */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 flex flex-col min-w-[220px] max-h-[480px] overflow-y-auto">
            <div className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-100">Entries</div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 flex-1 overflow-y-auto">
              {entries.length === 0 ? (
                <div className="text-gray-400 italic text-center py-8">No entries yet.</div>
              ) : (
                entries.slice().reverse().map((e, idx) => (
                  <div key={e.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 text-lg rounded-lg ${darkMode ? 'bg-gray-800' : ''}`}> 
                    <div className="flex-1 min-w-0">
                      <div className={`font-mono break-words ${darkMode ? 'text-white' : 'text-gray-700'}`}>{e.note ? <span className="font-semibold">{e.note}</span> : <span className="text-gray-400">(no note)</span>}</div>
                      {e.invoice && <div className="text-xs text-gray-400 mt-1">Invoice: <span className="font-semibold">{e.invoice}</span></div>}
                      {e.client && <div className="text-xs text-gray-400 mt-1">Client: <span className="font-semibold">{e.client}</span></div>}
                    </div>
                    <span className={`font-bold text-xl ${darkMode ? 'text-blue-200' : 'text-blue-900'} sm:ml-4`}>{e.amount}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Right: Input & Actions */}
          <div className="flex-1 flex flex-col gap-4 justify-between">
            <div>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter amount"
                className={`w-full py-4 px-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500'} text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2 transition-all duration-200`}
                aria-label="Enter amount"
                autoFocus
              />
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add note (optional)"
                className={`w-full py-4 px-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500'} text-lg font-normal focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200`}
                aria-label="Add note"
              />
              <input
                type="text"
                value={invoice}
                onChange={e => setInvoice(e.target.value)}
                placeholder="Invoice Number (optional)"
                className={`w-full py-4 px-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500'} text-lg font-normal focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200`}
                aria-label="Invoice Number"
              />
              <input
                type="text"
                value={client}
                onChange={e => setClient(e.target.value)}
                placeholder="Client Name (optional)"
                className={`w-full py-4 px-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500'} text-lg font-normal focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200`}
                aria-label="Client Name"
              />
              {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddEntry}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Add Entry
              </button>
              <button
                onClick={() => setShowTotal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400"
                tabIndex={0}
              >
                Subtotal: {handleSubtotal()}
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleTotal}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Total
              </button>
              <button
                onClick={handleExportPdf}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400 flex items-center justify-center gap-2"
              >
                <span className="inline-block align-middle text-xl">&#8681;</span> Export PDF
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleCopy}
                className={`flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400 ${copied ? 'opacity-80' : ''}`}
              >
                {copied ? 'Copied!' : 'Copy All'}
              </button>
              <button
                onClick={() => { setEntries([]); setCopied(false); setFeedbackGiven(null); }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-4 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400"
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
        {/* Calculation History below the calculator */}
        <CalculationHistory historyKey={FIN_HISTORY_KEY} title="Financial Calculator History" darkMode={darkMode} showUniversity={false} showProgress={false} />
        <AdBanner />
      </div>
    </>
  );
};

export default FinancialCalculator; 