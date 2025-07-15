import React from 'react';
import AdBanner from './AdBanner';

const Contact = () => (
  <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg mt-12 mb-12">
    <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Contact Us</h1>
    <div className="my-6 flex justify-center"><AdBanner /></div>
    <p className="mb-4 text-gray-700 dark:text-gray-300">
      Have questions, feedback, or want to get in touch? We'd love to hear from you!
    </p>
    <p className="mb-4 text-gray-700 dark:text-gray-300">
      Email us at <a href="mailto:gundappagaridhanush@gmail.com" className="underline text-blue-800 hover:text-blue-900 dark:text-blue-300 dark:hover:text-white">your@email.com</a>
    </p>
    {/* Placeholder for a contact form if you want to add one later */}
    {/* <form>...</form> */}
    <div className="my-6 flex justify-center"><AdBanner /></div>
  </div>
);

export default Contact; 