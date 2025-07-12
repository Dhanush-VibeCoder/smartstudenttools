import React from 'react';
import AdBanner from './AdBanner';

const PrivacyPolicy = () => (
  <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg mt-12 mb-12">
    <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Privacy Policy</h1>
    <div className="my-6 flex justify-center"><AdBanner /></div>
    <p className="mb-4 text-gray-700 dark:text-gray-300">
      <strong>Last updated:</strong> {new Date().toLocaleDateString()}
    </p>
    <p className="mb-4 text-gray-700 dark:text-gray-300">
      Your privacy is important to us. This app does not collect, store, or share any personal information unless explicitly stated. Any data you enter is processed locally in your browser and is not sent to any server.
    </p>
    <p className="mb-4 text-gray-700 dark:text-gray-300">
      If you have questions about privacy, contact us at <a href="mailto:your@email.com" className="underline text-blue-600">your@email.com</a>.
    </p>
    <p className="mb-4 text-gray-700 dark:text-gray-300">
      <strong>Advertising & Cookies:</strong> This site uses Google AdSense to display ads. Third-party vendors, including Google, may use cookies to serve ads based on your prior visits to this or other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="underline text-blue-800 hover:text-blue-900 dark:text-blue-300 dark:hover:text-white">Google Ads Settings</a>.
    </p>
    <p className="mb-4 text-gray-700 dark:text-gray-300">
      [Add more details here if you use analytics, cookies, or third-party services.]
    </p>
    <div className="my-6 flex justify-center"><AdBanner /></div>
  </div>
);

export default PrivacyPolicy; 