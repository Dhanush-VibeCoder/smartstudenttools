import React from 'react';
import AdBanner from './AdBanner';

const About = () => (
  <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg mt-12 mb-12">
    <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">About Smart Student Tools</h1>
    <div className="my-6 flex justify-center"><AdBanner /></div>
    <p className="mb-4 text-gray-700 dark:text-gray-300">
      <strong>Smart Student Tools</strong> was created to help students succeed by providing free, easy-to-use academic utilities. Our mission is to make academic planning, grade calculation, and exam prep accessible to everyone.
    </p>
    <p className="mb-4 text-gray-700 dark:text-gray-300">
      Built by students, for students, this app brings together essential tools like GPA conversion, attendance tracking, grade calculation, study planning, and more—all in one place. We believe in open access to educational resources and are always improving based on your feedback!
    </p>
    <p className="mb-4 text-gray-700 dark:text-gray-300">
      If you have suggestions or want to contribute, feel free to <a href="mailto:gundappagaridhanush@gmail.com" className="underline text-blue-800 hover:text-blue-900 dark:text-blue-300 dark:hover:text-white">contact us</a>.
    </p>
    <div className="my-6 flex justify-center"><AdBanner /></div>
  </div>
);

export default About; 