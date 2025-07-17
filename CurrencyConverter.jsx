import React, { useState } from 'react';
import AdBanner from './AdBanner.jsx';
import SEO from './SEO';

const CURRENCIES = ['USD', 'EUR', 'INR', 'GBP', 'JPY', 'AUD', 'CAD', 'CNY', 'Other'];

const CurrencyConverter = ({ darkMode }) => {
  // Currency Converter states
  const [amount, setAmount] = useState('');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('INR');
  const [rate, setRate] = useState('');
  const [converted, setConverted] = useState('');
  // Profit/Loss states
  const [cost, setCost] = useState('');
  const [sell, setSell] = useState('');
  const [plResult, setPlResult] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState('');

  // Currency conversion logic
  const handleConvert = () => {
    if (!amount || !rate || isNaN(amount) || isNaN(rate)) {
      setConverted('');
      return;
    }
    setConverted((parseFloat(amount) * parseFloat(rate)).toFixed(2));
  };

  // Profit/Loss logic
  const handleProfitLoss = () => {
    if (!cost || !sell || isNaN(cost) || isNaN(sell)) {
      setPlResult(null);
      return;
    }
    const profit = parseFloat(sell) - parseFloat(cost);
    const percent = (profit / parseFloat(cost)) * 100;
    setPlResult({ profit, percent });
  };

  // Fetch live exchange rate
  const fetchLiveRate = async () => {
    setRateLoading(true);
    setRateError('');
    try {
      const res = await fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}`);
      const data = await res.json();
      if (data && data.info && data.info.rate) {
        setRate(data.info.rate.toString());
      } else if (data && data.result) {
        setRate(data.result.toString());
      } else {
        setRateError('Could not fetch rate.');
      }
    } catch {
      setRateError('Could not fetch rate.');
    }
    setRateLoading(false);
  };

  return (
    <>
      <SEO
        title="Currency Converter - Smart Student Tools"
        description="Convert between major currencies, calculate profit/loss, and fetch live rates. Fast, free, and mobile-friendly."
        url="https://yourdomain.com/currency-converter"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': 'Currency Converter',
          'description': 'Convert between major currencies, calculate profit/loss, and fetch live rates. Fast, free, and mobile-friendly.',
          'applicationCategory': 'FinanceApplication',
          'operatingSystem': 'All',
          'url': 'https://yourdomain.com/currency-converter',
          'publisher': {
            '@type': 'Organization',
            'name': 'Smart Student Tools'
          }
        }}
      />
      <div className={`min-h-screen font-inter ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-teal-50 to-blue-100'}`}> 
        <div className={`w-full max-w-2xl mx-auto mt-6 mb-4 rounded-2xl shadow-lg p-4 text-3xl font-bold text-center ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-blue-900'}`}>Currency Converter</div>
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
          {/* Currency Converter Card */}
          <div className={`rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}> 
            <div className="text-xl font-semibold mb-4">Currency Converter</div>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <input
                type="text"
                value={amount}
                onChange={e => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="Amount"
                className={`flex-1 py-3 px-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500'} text-lg font-normal focus:outline-none focus:ring-2 focus:ring-blue-400`}
                aria-label="Amount"
              />
              <select
                value={from}
                onChange={e => setFrom(e.target.value)}
                className={`py-3 px-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-200 bg-gray-50 text-gray-900'} text-lg font-normal focus:outline-none focus:ring-2 focus:ring-blue-400`}
                aria-label="From currency"
              >
                {CURRENCIES.map(cur => <option key={cur} value={cur}>{cur}</option>)}
              </select>
              <span className={`self-center text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-700'}`}>→</span>
              <select
                value={to}
                onChange={e => setTo(e.target.value)}
                className={`py-3 px-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-200 bg-gray-50 text-gray-900'} text-lg font-normal focus:outline-none focus:ring-2 focus:ring-blue-400`}
                aria-label="To currency"
              >
                {CURRENCIES.map(cur => <option key={cur} value={cur}>{cur}</option>)}
              </select>
            </div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={rate}
                onChange={e => setRate(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="Exchange Rate"
                className={`flex-1 py-3 px-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500'} text-lg font-normal focus:outline-none focus:ring-2 focus:ring-blue-400`}
                aria-label="Exchange Rate"
              />
              <button
                onClick={fetchLiveRate}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all text-lg focus:outline-none focus:ring-2 focus:ring-purple-400 flex items-center gap-2"
                disabled={rateLoading}
                type="button"
              >
                {rateLoading ? 'Fetching...' : 'Fetch Live Rate'}
              </button>
              <button
                onClick={handleConvert}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Convert
              </button>
            </div>
            {rateError && (
              <div className="text-red-500 text-sm mb-2 flex flex-col items-start gap-1">
                <span>Could not fetch rate. Please check your internet connection, use standard currencies, or try again later.</span>
                <button
                  onClick={fetchLiveRate}
                  className="mt-1 bg-gray-700 hover:bg-gray-800 text-white font-bold py-1 px-3 rounded shadow text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={rateLoading}
                  type="button"
                >
                  Retry
                </button>
              </div>
            )}
            {converted && (
              <div className={`mt-2 p-3 rounded-lg text-center text-2xl font-bold ${darkMode ? 'bg-green-900 text-green-200' : 'bg-green-50 text-green-900'}`}>{amount} {from} = {converted} {to}</div>
            )}
          </div>
          {/* Profit/Loss Calculator Card */}
          <div className={`rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}> 
            <div className="text-xl font-semibold mb-4">Profit/Loss Calculator</div>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <input
                type="text"
                value={cost}
                onChange={e => setCost(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="Cost Price"
                className={`flex-1 py-3 px-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500'} text-lg font-normal focus:outline-none focus:ring-2 focus:ring-blue-400`}
                aria-label="Cost Price"
              />
              <input
                type="text"
                value={sell}
                onChange={e => setSell(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="Selling Price"
                className={`flex-1 py-3 px-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500'} text-lg font-normal focus:outline-none focus:ring-2 focus:ring-blue-400`}
                aria-label="Selling Price"
              />
            </div>
            <button
              onClick={handleProfitLoss}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all text-lg focus:outline-none focus:ring-2 focus:ring-green-400 mb-4"
            >
              Calculate
            </button>
            {plResult && (
              <div className={`mt-2 p-3 rounded-lg text-center text-xl font-bold ${plResult.profit >= 0 ? (darkMode ? 'bg-green-900 text-green-200' : 'bg-green-50 text-green-900') : (darkMode ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-900')}`}>
                {plResult.profit >= 0 ? 'Profit' : 'Loss'}: {plResult.profit.toFixed(2)} ({plResult.percent.toFixed(2)}%)
              </div>
            )}
          </div>
        </div>
        <AdBanner />
      </div>
    </>
  );
};

export default CurrencyConverter; 