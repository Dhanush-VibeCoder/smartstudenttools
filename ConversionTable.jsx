import React from 'react';

const cgpaToPercentage = [
  { cgpa: '6.0', percent: '57%' },
  { cgpa: '6.5', percent: '61.5%' },
  { cgpa: '7.0', percent: '66%' },
  { cgpa: '7.5', percent: '70.5%' },
  { cgpa: '8.0', percent: '75%' },
  { cgpa: '8.5', percent: '79.5%' },
  { cgpa: '9.0', percent: '84%' },
  { cgpa: '9.5', percent: '88.5%' },
  { cgpa: '10.0', percent: '93%' },
];
const percentageToCgpa = [
  { percent: '60%', cgpa: '6.25' },
  { percent: '65%', cgpa: '6.75' },
  { percent: '70%', cgpa: '7.25' },
  { percent: '75%', cgpa: '7.75' },
  { percent: '80%', cgpa: '8.25' },
  { percent: '85%', cgpa: '8.75' },
  { percent: '90%', cgpa: '9.25' },
  { percent: '95%', cgpa: '9.75' },
  { percent: '100%', cgpa: '10.0' },
];

const ConversionTable = () => (
  <div className="my-8">
    <h2 className="text-center text-xl font-bold mb-4">CGPA ↔ Percentage Quick Reference Table</h2>
    <div className="grid md:grid-cols-2 gap-8">
      {/* CGPA to Percentage Table */}
      <div>
        <h3 className="text-center text-base font-semibold mb-2">CGPA → Percentage</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-xl overflow-hidden text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-2 border-b text-left">CGPA</th>
                <th className="px-4 py-2 border-b text-left">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {cgpaToPercentage.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-4 py-2 border-b">{row.cgpa}</td>
                  <td className="px-4 py-2 border-b">{row.percent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Percentage to CGPA Table */}
      <div>
        <h3 className="text-center text-base font-semibold mb-2">Percentage → CGPA</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-xl overflow-hidden text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-2 border-b text-left">Percentage</th>
                <th className="px-4 py-2 border-b text-left">CGPA</th>
              </tr>
            </thead>
            <tbody>
              {percentageToCgpa.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-4 py-2 border-b">{row.percent}</td>
                  <td className="px-4 py-2 border-b">{row.cgpa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

export default ConversionTable; 