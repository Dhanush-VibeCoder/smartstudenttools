import React, { useState, useEffect, useRef, Suspense } from 'react';
const ConversionTable = React.lazy(() => import('./ConversionTable'));
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CalculationHistory from './CalculationHistory.jsx';

// --- GPAConverterTool Component ---
const GPAConverterTool = ({ darkMode }) => {
    const [gpaScale, setGpaScale] = useState('10.0'); // Default to 10.0 scale as per common Indian universities
    const [inputValue, setInputValue] = useState(''); // Can be GPA or Percentage
    const [convertedResult, setConvertedResult] = useState(null); // The calculated result
    const [conversionDirection, setConversionDirection] = useState('gpaToPercentage'); // 'gpaToPercentage' or 'percentageToGpa'
    const [university, setUniversity] = useState('Generic'); // 'Generic', 'VTU', 'Mumbai Univ'
    const [formulaUsed, setFormulaUsed] = useState('');
    const [error, setError] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [gpaLevelMessage, setGpaLevelMessage] = useState('');
    const [resultCardColor, setResultCardColor] = useState('');
    const [feedbackGiven, setFeedbackGiven] = useState(null); // null, 'yes', 'no'
  
    const [pendingInput, setPendingInput] = useState({
      inputValue: '',
      gpaScale: '10.0',
      conversionDirection: 'gpaToPercentage',
      university: 'Generic',
    });
  
    // Ref is no longer directly used for PDF content capture but kept for possible future use/debug
    const pdfTempRef = useRef(null);
    const resultCardRef = useRef(null);
  
    // Load html2pdf.js dynamically
    useEffect(() => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.async = true;
      document.body.appendChild(script);
  
      return () => {
        document.body.removeChild(script);
      };
    }, []);
  
    // Define university formulas with explanations and examples
    const universityFormulas = {
      'Generic': {
        gpaToPercentage: (gpa, scale) => (gpa / parseFloat(scale)) * 100,
        percentageToGpa: (percentage, scale) => (percentage / 100) * parseFloat(scale),
        formulaDisplay: {
          gpaToPercentage: "Percentage = (CGPA / Scale) × 100",
          percentageToGpa: "CGPA = (Percentage / 100) × Scale",
        },
        explanation: "This is a common linear scaling. It directly converts your GPA to a percentage based on the maximum possible GPA score. For example, on a 10.0 scale, a GPA of 8.0 would be $(8.0 / 10.0) \\times 100 = 80\\%.$",
        example: {
          gpaToPercentage: { input: "8.0 (on 10.0 scale)", output: "80%" },
          percentageToGpa: { input: "80%", output: "8.0 (on 10.0 scale)" }
        }
      },
      'VTU': {
        gpaToPercentage: (gpa) => (gpa - 0.75) * 10,
        percentageToGpa: (percentage) => (percentage / 10) + 0.75,
        formulaDisplay: {
          gpaToPercentage: "Percentage = (CGPA - 0.75) × 10",
          percentageToGpa: "CGPA = (Percentage / 10) + 0.75",
        },
        explanation: "VTU uses this as per official VTU Circular (Ref: VTU Guidelines). They deduct 0.75 from CGPA before multiplying by 10 to normalize grading scales.",
        example: {
          gpaToPercentage: { input: "8.25", output: "75%" },
          percentageToGpa: { input: "75%", output: "8.25" }
        }
      },
      'Anna University': {
        gpaToPercentage: (gpa) => (gpa - 0.5) * 10,
        percentageToGpa: (percentage) => (percentage / 10) + 0.5,
        formulaDisplay: {
          gpaToPercentage: "Percentage = (CGPA - 0.5) × 10",
          percentageToGpa: "CGPA = (Percentage / 10) + 0.5",
        },
        explanation: "Anna University's standard formula deducts 0.5 to align GPA scale with percentage format. Widely followed in Tamil Nadu colleges.",
        example: {
          gpaToPercentage: { input: "8.0", output: "75%" },
          percentageToGpa: { input: "75%", output: "8.0" }
        }
      },
      'Mumbai Univ': {
        gpaToPercentage: (gpa) => gpa * 7.1 + 11,
        percentageToGpa: (percentage) => (percentage - 11) / 7.1,
        formulaDisplay: {
          gpaToPercentage: "Percentage = CGPA × 7.1 + 11",
          percentageToGpa: "CGPA = (Percentage - 11) / 7.1",
        },
        explanation: "Mumbai University often uses a direct linear formula: 7.1 times CGPA plus 11. This is mentioned in their academic circulars.",
        example: {
          gpaToPercentage: { input: "7.5", output: "64.25%" },
          percentageToGpa: { input: "64.25%", output: "7.5" }
        }
      },
      'CBSE': {
        gpaToPercentage: (gpa) => gpa * 9.5,
        percentageToGpa: (percentage) => percentage / 9.5,
        formulaDisplay: {
          gpaToPercentage: "Percentage = CGPA × 9.5",
          percentageToGpa: "CGPA = Percentage / 9.5",
        },
        explanation: "This is the standard CBSE guideline for Class 10th CGPA to Percentage conversion, as per the official board handbook.",
        example: {
          gpaToPercentage: { input: "9.2", output: "87.4%" },
          percentageToGpa: { input: "87.4%", output: "9.2" }
        }
      },
      'ICSE': {
        gpaToPercentage: (gpa) => gpa * 9.5,
        percentageToGpa: (percentage) => percentage / 9.5,
        formulaDisplay: {
          gpaToPercentage: "Percentage = CGPA × 9.5 (Standard Practice)",
          percentageToGpa: "CGPA = Percentage / 9.5 (Standard Practice)",
        },
        explanation: "ICSE does not officially publish a CGPA to Percentage formula. The standard industry practice, often used by students or colleges, is to apply the CBSE rule: multiply CGPA by 9.5.",
        example: {
          gpaToPercentage: { input: "8.4", output: "79.8%" },
          percentageToGpa: { input: "79.8%", output: "8.4" }
        }
      },
      'Delhi University': {
        gpaToPercentage: (gpa) => gpa * 9.5,
        percentageToGpa: (percentage) => percentage / 9.5,
        formulaDisplay: {
          gpaToPercentage: "Percentage = Final GPA × 9.5 (or college-specific rule)",
          percentageToGpa: "GPA = Percentage / 9.5 (or college-specific rule)",
        },
        explanation: "Some Delhi University colleges follow the CBSE 9.5 multiplier rule, but the conversion is often program-specific. It is advisable to check with your specific department or college for their official guidelines.",
        example: {
          gpaToPercentage: { input: "7.2", output: "68.4%" },
          percentageToGpa: { input: "68.4%", output: "7.2" }
        }
      },
      'JNTU Hyderabad': {
        gpaToPercentage: (gpa) => (gpa - 0.75) * 10,
        percentageToGpa: (percentage) => (percentage / 10) + 0.75,
        formulaDisplay: {
          gpaToPercentage: "Percentage = (CGPA - 0.75) × 10",
          percentageToGpa: "CGPA = (Percentage / 10) + 0.75",
        },
        explanation: "JNTU Hyderabad's official method aligns with VTU's logic, where 0.75 is deducted from the CGPA before multiplying by 10. This is a commonly accepted conversion for their transcripts.",
        example: {
          gpaToPercentage: { input: "7.8", output: "70.5%" },
          percentageToGpa: { input: "70.5%", output: "7.8" }
        }
      },
      'Osmania University': {
        gpaToPercentage: (gpa) => (gpa - 0.5) * 10,
        percentageToGpa: (percentage) => (percentage / 10) + 0.5,
        formulaDisplay: {
          gpaToPercentage: "Percentage = (CGPA - 0.5) × 10",
          percentageToGpa: "CGPA = (Percentage / 10) + 0.5",
        },
        explanation: "Osmania University also uses a deduction pattern similar to Anna University for percentage normalization, where 0.5 is subtracted from the CGPA before multiplying by 10.",
        example: {
          gpaToPercentage: { input: "7.5", output: "70%" },
          percentageToGpa: { input: "70%", output: "7.5" }
        }
      },
    };
  
    // Save calculation to history in localStorage
    const saveToHistory = (input, output, university, type) => {
      const HISTORY_KEY = 'gpa_calc_history';
      const newEntry = {
        id: Date.now(),
        input: input.toString(),
        output: output.toString(),
        university,
        type,
        date: new Date().toISOString(),
      };
      let history = [];
      try {
        const stored = localStorage.getItem(HISTORY_KEY);
        if (stored) history = JSON.parse(stored);
      } catch {}
      history.unshift(newEntry); // newest at top
      if (history.length > 50) history = history.slice(0, 50); // limit size
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    };
  
    const handleInputChange = (e) => {
      const value = e.target.value;
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setPendingInput((prev) => ({ ...prev, inputValue: value }));
        setFeedbackGiven(null); // Reset feedback on new input
      }
    };
  
    const handleClear = () => {
      setPendingInput({
        inputValue: '',
        gpaScale: '10.0',
        conversionDirection: 'gpaToPercentage',
        university: 'Generic',
      });
      setInputValue('');
      setGpaScale('10.0');
        setConvertedResult(null);
        setGpaLevelMessage('');
        setResultCardColor('');
        setError('');
      setIsAnimating(false);
      setConversionDirection('gpaToPercentage');
      setUniversity('Generic');
        setFormulaUsed('');
      setFeedbackGiven(null);
      // Do NOT clear calculation history here
    };
  
    const generatePdf = async () => {
      if (!convertedResult || error) {
        alert('No result available to download as PDF.');
        return;
      }
      if (!resultCardRef.current) {
        alert('Result card not found.');
        return;
      }
      try {
        const canvas = await html2canvas(resultCardRef.current, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        // Calculate image dimensions to fit nicely
        const imgWidth = pageWidth * 0.8;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const x = (pageWidth - imgWidth) / 2;
        const y = 60;
        pdf.text('CGPA to Percentage Report', pageWidth / 2, 40, { align: 'center' });
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        pdf.save('CGPA_Report.pdf');
      } catch (err) {
        alert('Failed to generate PDF.');
      }
    };
  
    const resultAnimationClasses = isAnimating
      ? 'opacity-100 translate-y-0 scale-100'
      : 'opacity-0 translate-y-4 scale-95';
  
    // Accordion toggle logic for FAQ
    const toggleAccordion = (event) => {
      const header = event.currentTarget;
      const content = header.nextElementSibling;
      const icon = header.querySelector('.accordion-icon');
  
      if (content.classList.contains('max-h-0')) {
        content.classList.remove('max-h-0');
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.classList.remove('rotate-0');
        icon.classList.add('rotate-45');
        icon.textContent = '−';
          } else {
        content.style.maxHeight = '0px';
        content.classList.add('max-h-0');
        icon.classList.remove('rotate-45');
        icon.classList.add('rotate-0');
        icon.textContent = '+';
      }
    };
  
    // Move validateInput and updateGpaLevelMessage above handleConvert
    const validateInput = () => {
      const value = parseFloat(pendingInput.inputValue);
      const scale = parseFloat(pendingInput.gpaScale);
      let newError = '';
  
              if (isNaN(value) || pendingInput.inputValue.trim() === '') {
        newError = `Please enter a valid ${pendingInput.conversionDirection === 'gpaToPercentage' ? 'CGPA score' : 'percentage'}.`;
        setError(newError);
        return false;
      }
      if (value < 0) {
        newError = `${pendingInput.conversionDirection === 'gpaToPercentage' ? 'CGPA score' : 'Percentage'} cannot be negative.`;
        setError(newError);
        return false;
      }
  
      if (pendingInput.conversionDirection === 'gpaToPercentage') {
        // GPA to Percentage validation
        if (pendingInput.university === 'Generic' && value > scale) {
          newError = `CGPA score cannot exceed ${pendingInput.gpaScale} on this scale.`;
        } else if ([
          'VTU',
          'Anna University',
          'Mumbai Univ',
          'CBSE',
          'ICSE',
          'Delhi University',
          'JNTU Hyderabad',
          'Osmania University',
        ].includes(pendingInput.university) && value > 10.0) {
          newError = `CGPA for ${pendingInput.university} cannot exceed 10.0.`;
        }
      } else if (pendingInput.conversionDirection === 'percentageToGpa') {
        // Percentage to GPA validation
        if (value > 100) {
          newError = 'Percentage cannot exceed 100%.';
        }
        // Do NOT show GPA scale error for % to GPA
      }
  
      setError(newError);
      return newError === '';
    };
  
    const updateGpaLevelMessage = (value, mode = 'percentage') => {
      let message = '';
      let colorClass = '';

      if (mode === 'percentage') {
        if (value >= 90) {
          message = 'Excellent! Outstanding academic performance.';
          colorClass = 'bg-green-100 border-green-300 text-green-800 dark:bg-green-700 dark:border-green-600 dark:text-green-100';
        } else if (value >= 80) {
          message = 'Very Good! Above average performance.';
          colorClass = 'bg-green-100 border-green-300 text-green-800 dark:bg-green-700 dark:border-green-600 dark:text-green-100';
        } else if (value >= 70) {
          message = 'Good! Solid academic performance.';
          colorClass = 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-700 dark:border-orange-600 dark:text-orange-100';
        } else if (value >= 60) {
          message = 'Average. Meets basic requirements.';
          colorClass = 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-700 dark:border-yellow-600 dark:text-yellow-100';
        } else {
          message = 'Below Average. Needs improvement.';
          colorClass = 'bg-red-100 border-red-300 text-red-800 dark:bg-red-700 dark:border-red-600 dark:text-red-100';
        }
      } else if (mode === 'gpa') {
        if (value >= 9) {
          message = 'Excellent! Top-tier CGPA.';
          colorClass = 'bg-green-100 border-green-300 text-green-800 dark:bg-green-700 dark:border-green-600 dark:text-green-100';
        } else if (value >= 8) {
          message = 'Very Good! Strong academic standing.';
          colorClass = 'bg-green-100 border-green-300 text-green-800 dark:bg-green-700 dark:border-green-600 dark:text-green-100';
        } else if (value >= 7) {
          message = 'Good! Solid performance.';
          colorClass = 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-700 dark:border-orange-600 dark:text-orange-100';
        } else if (value >= 6) {
          message = 'Average. Meets requirements.';
          colorClass = 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-700 dark:border-yellow-600 dark:text-yellow-100';
        } else {
          message = 'Below Average. Needs improvement.';
          colorClass = 'bg-red-100 border-red-300 text-red-800 dark:bg-red-700 dark:border-red-600 dark:text-red-100';
        }
      }
      setGpaLevelMessage(message);
      setResultCardColor(colorClass);
    };
  
    // Convert button handler
    const handleConvert = () => {
      // Validate input
      if (pendingInput.inputValue.trim() === '' || isNaN(parseFloat(pendingInput.inputValue))) {
      setConvertedResult(null);
      setGpaLevelMessage('');
      setResultCardColor('');
      setIsAnimating(false);
        setError('');
      setFormulaUsed('');
          return;
      }
      setInputValue(pendingInput.inputValue);
      setGpaScale(pendingInput.gpaScale);
      setUniversity(pendingInput.university);
      // Conversion logic
      if (validateInput()) {
        const value = parseFloat(pendingInput.inputValue);
        let result;
        let formulaText;
        const currentFormulas = universityFormulas[pendingInput.university];
        if (conversionDirection === 'gpaToPercentage') {
          if (pendingInput.university === 'Generic') {
            result = currentFormulas.gpaToPercentage(value, pendingInput.gpaScale);
          } else {
            result = currentFormulas.gpaToPercentage(value);
          }
          formulaText = currentFormulas.formulaDisplay.gpaToPercentage;
          updateGpaLevelMessage(result, 'percentage');
          saveToHistory(pendingInput.inputValue, result.toFixed(2), pendingInput.university, 'CGPA → %');
        } else {
          if (pendingInput.university === 'Generic') {
            result = currentFormulas.percentageToGpa(value, pendingInput.gpaScale);
          } else {
            result = currentFormulas.percentageToGpa(value);
          }
          formulaText = currentFormulas.formulaDisplay.percentageToGpa;
          updateGpaLevelMessage(result, 'gpa'); // Use result (CGPA) for message and color
          saveToHistory(pendingInput.inputValue, result.toFixed(2), pendingInput.university, '% → CGPA');
        }
        setConvertedResult(result.toFixed(2));
        setFormulaUsed(formulaText);
        setIsAnimating(true);
      } else {
        setConvertedResult(null);
        setGpaLevelMessage('');
        setResultCardColor('');
        setIsAnimating(false);
        setFormulaUsed('');
      }
    };
  
    return (
      <div className={`p-4 font-inter min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-teal-50 to-blue-100'}`}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-10 transition hover:shadow-xl hover:scale-[1.02] duration-200 max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold leading-tight mb-2 text-gray-900 dark:text-gray-100 flex items-center justify-center whitespace-nowrap">
              <span className="mr-2 text-2xl md:text-3xl">🎓</span> CGPA to Percentage Converter
            </h2>
            <p className="text-base md:text-lg font-normal leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
              Easily convert your CGPA to percentage (and vice versa) for college applications or transcripts.
            </p>
            <div className="my-6 max-w-2xl mx-auto bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-xl p-4 text-sm md:text-base text-gray-800 dark:text-gray-200">
              <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">What’s the difference between GPA and CGPA?</h3>
              <ul className="list-disc list-inside mb-2">
                <li><span className="font-bold">GPA</span> (Grade Point Average): Average for a single semester or term. Shows your performance in that specific period.</li>
                <li><span className="font-bold">CGPA</span> (Cumulative GPA): Overall average across all semesters/terms. Shows your total academic performance.</li>
              </ul>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <span className="font-semibold">Example GPA:</span> If you scored 8, 7, 9, and 6 in four subjects in one semester:<br />
                  GPA = (8 + 7 + 9 + 6) / 4 = <span className="font-bold">7.5</span>
                </div>
                <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <span className="font-semibold">Example CGPA:</span> If your GPAs for 4 semesters are 7.5, 8.0, 7.0, and 8.5:<br />
                  CGPA = (7.5 + 8.0 + 7.0 + 8.5) / 4 = <span className="font-bold">7.75</span>
                </div>
              </div>
            </div>
          </div>
  
          {/* Input Section Card */}
          <div className={`p-6 rounded-xl shadow-inner border space-y-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h3 className={`text-2xl font-bold text-center mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Conversion Options</h3>
            {/* Conversion Direction Toggle */}
            <div className="flex justify-center mb-4">
              <div className={`relative inline-flex rounded-full p-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <button
                  className={`font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${
                    conversionDirection === 'gpaToPercentage' ? 'bg-blue-800 text-white shadow' : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
                  }`}
                  onClick={() => {
                      setConversionDirection('gpaToPercentage');
                      setPendingInput(prev => ({ ...prev, conversionDirection: 'gpaToPercentage' }));
                      setConvertedResult(null); // Clear result on direction change
                      setFormulaUsed('');
                      setError('');
                      setIsAnimating(false);
                      setFeedbackGiven(null);
                  }}
                >
                  CGPA → %
                </button>
                <button
                  className={`font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${
                    conversionDirection === 'percentageToGpa' ? 'bg-blue-800 text-white shadow' : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
                  }`}
                  onClick={() => {
                      setConversionDirection('percentageToGpa');
                      setPendingInput(prev => ({ ...prev, conversionDirection: 'percentageToGpa' }));
                      setConvertedResult(null); // Clear result on direction change
                      setFormulaUsed('');
                      setError('');
                      setIsAnimating(false);
                      setFeedbackGiven(null);
                  }}
                >
                  % → CGPA
                </button>
              </div>
            </div>
  
            {/* University Selection */}
            <div>
              <label htmlFor="university-select-main" className="sr-only">University</label>
              <select
                id="university-select-main"
                name="university-select"
                autoComplete="off"
                value={pendingInput.university}
                onChange={(e) => {
                  setPendingInput(prev => ({
                    ...prev,
                    university: e.target.value,
                    gpaScale: '10.0', // reset scale for all
                  }));
                  setConvertedResult(null);
                    setFormulaUsed('');
                    setError('');
                    setIsAnimating(false);
                    setFeedbackGiven(null);
                }}
                className={`block appearance-none w-full py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              >
                <option value="Generic">Generic Conversion</option>
                <option value="VTU">VTU (Visvesvaraya Technological University)</option>
                <option value="Anna University">Anna University</option>
                <option value="Mumbai Univ">University of Mumbai</option>
                <option value="CBSE">CBSE (Central Board of Secondary Education)</option>
                <option value="ICSE">ICSE (Indian Certificate of Secondary Education)</option>
                <option value="Delhi University">Delhi University (DU)</option>
                <option value="JNTU Hyderabad">JNTU Hyderabad</option>
                <option value="Osmania University">Osmania University</option>
              </select>
            </div>
  
            {/* CGPA Scale Selection (Visible only for Generic conversion) */}
            {pendingInput.university === 'Generic' && (
                <div>
                  <label htmlFor="gpa-scale-main" className="sr-only">CGPA Scale</label>
                  <select
                    id="gpa-scale-main"
                    name="gpa-scale"
                    autoComplete="off"
                    value={pendingInput.gpaScale}
                    onChange={(e) => {
                      setPendingInput(prev => ({ ...prev, gpaScale: e.target.value }));
                        setConvertedResult(null);
                        setFormulaUsed('');
                        setError('');
                        setIsAnimating(false);
                        setFeedbackGiven(null);
                      }}
                    className={`block appearance-none w-full py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                  >
                    <option value="10.0">10.0 Scale</option>
                    <option value="4.0">4.0 Scale</option>
                    <option value="5.0">5.0 Scale</option>
                  </select>
                </div>
            )}
  
            {/* Input Field (dynamic label) */}
            <div>
              <label htmlFor="gpa-input-main" className="sr-only">CGPA or Percentage Input</label>
              <input
                type="text"
                id="gpa-input-main"
                name="gpa-input"
                autoComplete="off"
                value={pendingInput.inputValue}
                onChange={handleInputChange}
                placeholder={pendingInput.conversionDirection === 'gpaToPercentage' ? `e.g., ${pendingInput.gpaScale === '10.0' ? '8.5' : '3.5'}` : 'e.g., 85'}
                className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${error ? 'border-red-500' : `${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 text-gray-700'}`}`}
              />
              {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
            </div>
            {/* Convert & Reset Buttons */}
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleConvert}
                className={`flex-1 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105
                  ${darkMode ? 'bg-blue-700 hover:bg-blue-600 text-white focus:ring-blue-500' : 'bg-blue-800 hover:bg-blue-900 text-white focus:ring-blue-800'}`}
              >
                Convert
              </button>
              <button
                onClick={handleClear}
                className={`flex-1 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105
                  ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100 focus:ring-gray-500' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400'}`}
              >
                Reset
              </button>
            </div>
  
          </div>
  
  
          {convertedResult !== null && !error && (
            <div
              ref={resultCardRef}
              className={`text-center p-6 rounded-xl shadow-md transform transition-all duration-500 ease-out ${resultAnimationClasses} ${resultCardColor}`}
            >
              <p className="text-xl font-semibold mb-2">
                {conversionDirection === 'gpaToPercentage' ? 'Converted Percentage:' : 'Converted CGPA:'}
              </p>
              <p className="text-5xl font-extrabold mb-4">
                {convertedResult} {conversionDirection === 'gpaToPercentage' ? '%' : ''}
              </p>
              <p className="text-lg font-medium">
                {gpaLevelMessage}
              </p>
              {formulaUsed && (
                  <p className={`text-sm mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Formula Used: <span className="font-semibold">{formulaUsed}</span>
                  </p>
              )}
  
              {/* Feedback Section */}
              <div className="mt-6">
                <p className={`text-md font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>⭐ Was this accurate?</p>
                <div className="flex justify-center space-x-4 mt-2">
                  <button
                    onClick={() => setFeedbackGiven('yes')}
                    className={`font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${
                      feedbackGiven === 'yes' ? 'bg-green-500 text-white' : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-green-600' : 'bg-gray-200 text-gray-700 hover:bg-green-100'}`
                    }`}
                  >
                    👍 Yes
                  </button>
                  <button
                    onClick={() => setFeedbackGiven('no')}
                    className={`font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${
                      feedbackGiven === 'no' ? 'bg-red-500 text-white' : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-red-600' : 'bg-gray-200 text-gray-700 hover:bg-red-100'}`
                    }`}
                  >
                    👎 No
                  </button>
                </div>
              </div>
            </div>
          )}
  
          {convertedResult !== null && !error && (
            <div className="flex justify-center">
              <button
                onClick={generatePdf}
                className={`w-full font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode ? 'bg-teal-800 hover:bg-teal-900 text-white' : 'bg-teal-700 hover:bg-teal-800 text-white'}`}
              >
                Download PDF
              </button>
            </div>
          )}
  
          {/* Calculation History below the result */}
          {convertedResult !== null && !error && (
            <CalculationHistory />
          )}

          {/* Conversion Table below the calculator result */}
          <div className="my-8">
            <Suspense fallback={<div>Loading table...</div>}>
              <ConversionTable />
            </Suspense>
          </div>

          {/* FAQ Section */}
          <div className={`p-5 rounded-lg border shadow-sm space-y-3 ${darkMode ? 'bg-purple-900 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
              <h3 className={`font-bold text-lg mb-4 text-center ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
                  ❓ Frequently Asked Questions
              </h3>
              <div className="space-y-2">
                  <div className={`bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow-inner border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <button onClick={toggleAccordion} className={`accordion-header w-full text-left font-semibold py-2 flex justify-between items-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                          <span>What is CGPA and how is it different from GPA?</span>
                          <span className="accordion-icon text-2xl rotate-0 transition-transform duration-300">+</span>
                      </button>
                      <div className={`accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <p className="pt-2">GPA (Grade Point Average) is typically calculated for a single semester or academic term, while CGPA (Cumulative Grade Point Average) is the average of all GPAs obtained over all semesters or the entire course of study.</p>
                      </div>
                  </div>
                  <div className={`bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow-inner border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <button onClick={toggleAccordion} className={`accordion-header w-full text-left font-semibold py-2 flex justify-between items-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                          <span>Why do universities use different conversion formulas?</span>
                          <span className="accordion-icon text-2xl rotate-0 transition-transform duration-300">+</span>
                      </button>
                      <div className={`accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <p className="pt-2">Grading systems vary significantly between countries and even within different universities in the same country. Each institution develops a formula that best reflects its specific grading philosophy and academic standards, making direct comparisons difficult without a conversion.</p>
                      </div>
                  </div>
                  <div className={`bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow-inner border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <button onClick={toggleAccordion} className={`accordion-header w-full text-left font-semibold py-2 flex justify-between items-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                          <span>Is the "Generic Conversion" accurate for all universities?</span>
                          <span className="accordion-icon text-2xl rotate-0 transition-transform duration-300">+</span>
                      </button>
                      <div className={`accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <p className="pt-2">The "Generic Conversion" provides a linear estimation. While useful for general understanding, it may not be officially recognized by all institutions. Always prioritize the specific formula provided by your university or the receiving institution.</p>
                      </div>
                  </div>
                  <div className={`bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow-inner border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <button onClick={toggleAccordion} className={`accordion-header w-full text-left font-semibold py-2 flex justify-between items-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                          <span>How does the CBSE CGPA to Percentage conversion work?</span>
                          <span className="accordion-icon text-2xl rotate-0 transition-transform duration-300">+</span>
                      </button>
                      <div className={`accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <p className="pt-2">For CBSE, the standard guideline for Class 10th CGPA to Percentage conversion is to multiply your CGPA by 9.5. This is based on the official board handbook. For example, a CGPA of 9.2 converts to $9.2 \times 9.5 = 87.4\%$.</p>
                      </div>
                  </div>
                   <div className={`bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow-inner border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <button onClick={toggleAccordion} className={`accordion-header w-full text-left font-semibold py-2 flex justify-between items-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                          <span>What is the conversion for ICSE or Delhi University?</span>
                          <span className="accordion-icon text-2xl rotate-0 transition-transform duration-300">+</span>
                      </button>
                      <div className={`accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <p className="pt-2">ICSE does not officially publish a CGPA to Percentage formula, so the standard practice is to use the CBSE rule: Percentage = CGPA $\times$ 9.5. For Delhi University, some colleges also follow the GPA $\times$ 9.5 rule, but it's best to check your specific department's guidelines.</p>
                      </div>
                  </div>
                  <div className={`bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow-inner border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <button onClick={toggleAccordion} className={`accordion-header w-full text-left font-semibold py-2 flex justify-between items-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                          <span>Can I download a report of my conversion?</span>
                          <span className="accordion-icon text-2xl rotate-0 transition-transform duration-300">+</span>
                      </button>
                      <div className={`accordion-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <p className="pt-2">Yes, once you get a converted result, a "Download PDF" button will appear. Clicking this will generate a simple PDF report of your conversion for your records.</p>
                      </div>
                  </div>
              </div>
          </div>
  
          {/* Description Section */}
          <div className={`p-5 rounded-lg border shadow-sm space-y-3 ${darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
            <h3 className={`font-bold text-lg mb-3 ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              📘 What is CGPA to Percentage Conversion?
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="font-semibold">CGPA (Cumulative Grade Point Average)</span> is a measure of your overall academic performance across all semesters or years. Many universities and employers require your CGPA to be converted to a percentage for applications, eligibility, or evaluation purposes. This tool helps you convert your CGPA to percentage (and vice versa) using the most common and university-specific formulas.
            </p>
            <h3 className={`font-bold text-lg mb-3 ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              🤔 Why is it Confusing?
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              The conversion isn't always straightforward because each university or board might use a unique formula. A generic conversion might not be accurate for your specific institution. This tool attempts to address that by including specific university formulas.
            </p>
            <h3 className={`font-bold text-lg mb-3 ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              🧮 How Each Formula Works:
            </h3>
            <ul className={`list-disc list-inside text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Generic Conversion:
                <p className="text-sm italic mb-2">
                  This is a common linear scaling. For example, on a 10.0 scale, a GPA of 8.0 would be $(8.0 / 10.0) \times 100 = 80\%.$
                </p>
              </li>
              <li className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>VTU (Visvesvaraya Technological University):
                <p className="text-sm italic mb-2">
                  This formula has been widely used by VTU for converting CGPA to percentage as per official VTU Circulars.
                  Percentage = $(CGPA - 0.75) \times 10$ <br/> Example: CGPA = 8.25 $\rightarrow$ Percentage = $(8.25 – 0.75) \times 10 = 75\%.$
                </p>
              </li>
              <li className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Anna University (Tamil Nadu):
                <p className="text-sm italic mb-2">
                  Anna University's standard formula deducts 0.5 to align GPA scale with percentage format.
                  Percentage = $(CGPA - 0.5) \times 10$ <br/> Example: CGPA = 8.0 $\rightarrow$ Percentage = $(8.0 – 0.5) \times 10 = 75\%.$
                </p>
              </li>
              <li className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>University of Mumbai:
                <p className="text-sm italic mb-2">
                  Mumbai University often uses a direct linear formula.
                  Percentage = $CGPA \times 7.1 + 11$ <br/> Example: CGPA = 7.5 $\rightarrow$ Percentage = $(7.5 \times 7.1) + 11 = 64.25\%.$
                </p>
              </li>
              <li className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>CBSE (Central Board of Secondary Education):
                <p className="text-sm italic mb-2">
                  CBSE uses a simple multiplication factor for conversion.
                  Percentage = $CGPA \times 9.5$ <br/> Example: CGPA = 9.0 $\rightarrow$ Percentage = $9.0 \times 9.5 = 85.5\%.$
                </p>
              </li>
            </ul>
            <h3 className={`font-bold text-lg mt-3 mb-3 ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              ⚠️ Disclaimer:
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              This tool provides an estimated conversion based on common formulas. Always verify your institution's official conversion policy or consult with your academic department for exact figures.
            </p>
          </div>
  
          {/* Call to Action Section */}
          <div className={`p-5 rounded-lg border shadow-sm text-center space-y-3 ${darkMode ? 'bg-teal-900 border-teal-700' : 'bg-teal-50 border-teal-200'}`}>
              <h3 className={`font-bold text-lg ${darkMode ? 'text-teal-200' : 'text-teal-800'}`}>
                  Loved this tool?
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Help other students by sharing it or bookmarking for quick access!
              </p>
              <div className="flex justify-center space-x-4 mt-4">
                  <button
                      onClick={() => navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied!'))}
                      className={`font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-teal-800 hover:bg-teal-900 text-white' : 'bg-teal-700 hover:bg-teal-800 text-white'}`}
                  >
                      🔗 Share Tool
                  </button>
                  <button
                      onClick={() => {
                          try {
                              window.sidebar.addPanel(document.title, window.location.href, '');
                          } catch (e) {
                              alert('Press Ctrl+D (Windows/Linux) or Cmd+D (Mac) to bookmark this page!');
                          }
                      }}
                      className={`font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                  >
                      ⭐ Bookmark
                  </button>
              </div>
          </div>
        </div>
      </div>
    );
  };
  // --- End GPAConverterTool Component ---

export default GPAConverterTool; 