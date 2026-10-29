import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdsterraBanner from './AdsterraBanner';
import SEO from './SEO';

const CURRENCIES = ['USD', 'EUR', 'INR', 'GBP', 'JPY', 'AUD', 'CAD', 'CNY', 'Other'];

const CurrencyConverter = ({ darkMode }) => {
  const [rating, setRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

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
        title="Live Currency Converter | Real-Time Exchange Rates - Smart Studies"
        description="Convert USD, INR, EUR, GBP, and 150+ world currencies with live exchange rates, profit/loss calculator, and trend analysis."
        url="https://smartstudenttools.xyz/currency-converter"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': 'Currency Converter',
          'description': 'Convert between major currencies, calculate profit/loss, and fetch live rates. Fast, free, and mobile-friendly.',
          'applicationCategory': 'FinanceApplication',
          'operatingSystem': 'All',
          'url': 'https://smartstudenttools.xyz/currency-converter',
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

        {/* Structured Content Section */}
        <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8 text-gray-800 dark:text-gray-200">
          
          {/* About Currency Markets */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold">📘 About Currency Volatility &amp; Profit Margins</h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              International business, studying abroad, and digital freelancing involve converting currencies. Exchange rates represent the value of one nation's currency relative to another and fluctuate constantly based on economic reports and inflation. When buying and selling goods internationally, business owners must calculate profit and loss margins correctly by comparing acquisition costs and selling rates in standardized units.
            </p>
          </div>

          {/* How to Use Section */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold">📖 How to Use the Currency &amp; Profit Calculator</h3>
            <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li>To convert currency: enter the amount, select the source (From) currency, target (To) currency, and input the current live rate. Press **Convert**.</li>
              <li>To calculate trade profits: navigate to the **Profit/Loss** card at the bottom.</li>
              <li>Input your cost price (acquisition value) and selling price.</li>
              <li>Click **Calculate** to see your absolute net returns and percentage margin.</li>
            </ol>
          </div>

          {/* Formulas Section */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold">📊 Conversion &amp; Profit Equations</h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              The calculations use basic algebraic ratios:
              <br />
              - **Currency Conversion:**
              <code className="block my-2 bg-gray-100 dark:bg-gray-950 p-2 rounded font-mono text-center">
                Converted Amount = Input Amount * Exchange Rate
              </code>
              - **Profit/Loss Margin:**
              <code className="block my-2 bg-gray-100 dark:bg-gray-950 p-2 rounded font-mono text-center">
                Net Profit = Selling Price - Cost Price
                <br />
                Profit Margin % = (Net Profit / Cost Price) * 100
              </code>
            </p>
          </div>

          {/* Practical Example */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold">✏️ Practical Example Calculations</h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              - **Exchange Example:** You wish to convert $500 USD to Indian Rupees (INR) at an exchange rate of 83.20.
              <br />
              <code className="block my-1 bg-gray-100 dark:bg-gray-950 p-1 rounded font-mono">
                Converted Amount = 500 * 83.20 = ₹41,600
              </code>
              - **Profit/Loss Example:** A student imports items for ₹5,000 and sells them on campus for ₹6,500.
              <br />
              <code className="block my-1 bg-gray-100 dark:bg-gray-950 p-1 rounded font-mono">
                Net Profit = 6500 - 5000 = ₹1,500
                <br />
                Profit Margin % = (1500 / 5000) * 100 = 30%
              </code>
            </p>
          </div>

          {/* Advantages Section */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold">🌟 Advantages of our Conversion Tools</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li><span className="font-semibold text-gray-950 dark:text-white">Dual Capability:</span> Combine abstract foreign exchange maths and core trade profit estimations in one dashboard.</li>
              <li><span className="font-semibold text-gray-950 dark:text-white">Live Input Flexibility:</span> Allows custom entry of exchange rates since online market spreads fluctuate by bank.</li>
              <li><span className="font-semibold text-gray-950 dark:text-white">Color-Coded Status:</span> The result panels render green for profit gains and red for losses instantly.</li>
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
                  <span>What is the bid-ask spread?</span>
                  <span className="accordion-icon text-xl transition-transform duration-300">+</span>
                </button>
                <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm text-gray-600 dark:text-gray-300">
                  <p className="pt-2">The bid-ask spread is the difference between the buying price (bid) and selling price (ask) of a currency. Banks and exchange brokers use this spread to generate commission profits on exchanges.</p>
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
                  <span>Is profit margin calculated on cost or sell price?</span>
                  <span className="accordion-icon text-xl transition-transform duration-300">+</span>
                </button>
                <div className="accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out text-sm text-gray-600 dark:text-gray-300">
                  <p className="pt-2">In retail economics, profit margin percentage is generally calculated relative to the cost price (also known as markup). Our tool uses cost price as the base factor for standard returns evaluation.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Tools & Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h4 className="font-bold text-lg mb-3">🛠️ Related Math Tools</h4>
              <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                <li><Link to="/financial-calculator" className="hover:underline">Financial Calculator</Link></li>
                <li><Link to="/expense-tracker" className="hover:underline">Expense Tracker</Link></li>
                <li><Link to="/gst-calculator" className="hover:underline">GST Calculator</Link></li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h4 className="font-bold text-lg mb-3">📚 Related Articles</h4>
              <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                <li><a href="https://yourdomain.com/blog/forex-basics" target="_blank" rel="noopener noreferrer" className="hover:underline">Foreign Exchange Basics: How Rates are Determined</a></li>
                <li><a href="https://yourdomain.com/blog/business-profits-margins" target="_blank" rel="noopener noreferrer" className="hover:underline">Understanding Markup vs Profit Margins</a></li>
              </ul>
            </div>
          </div>

          {/* Interactive Rating Component */}
          <div className="p-6 rounded-xl border shadow-sm text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Rate &amp; Give Feedback</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Help us improve the currency conversion tools</p>
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

export default CurrencyConverter; 
