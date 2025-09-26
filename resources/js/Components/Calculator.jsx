// components/Calculator.jsx
import React, { useState, useEffect } from 'react';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [memory, setMemory] = useState(0);
  const [isRad, setIsRad] = useState(true);
  const [isShift, setIsShift] = useState(false);
  const [showFormula, setShowFormula] = useState(true);
  const [currentOperation, setCurrentOperation] = useState('');
  const [isFunctionMode, setIsFunctionMode] = useState(false); // State baru untuk mode fungsi
  const [pendingFunction, setPendingFunction] = useState(''); // State untuk fungsi yang sedang menunggu input

  const handleButtonClick = (value) => {
    console.log('Button clicked:', value);
    
    // Reset jika ada error
    if (display === 'Error' || display === 'Infinity' || display === 'NaN') {
      setDisplay('0');
      setExpression('');
      setCurrentOperation('');
      setIsFunctionMode(false);
      setPendingFunction('');
    }

    switch (value) {
      case 'C':
        setDisplay('0');
        setExpression('');
        setCurrentOperation('');
        setIsFunctionMode(false);
        setPendingFunction('');
        break;
      
      case 'CE':
        setDisplay('0');
        setCurrentOperation('');
        setIsFunctionMode(false);
        setPendingFunction('');
        break;
      
      case 'DEL':
        if (isFunctionMode) {
          // Jika dalam mode fungsi, batalkan mode fungsi
          setIsFunctionMode(false);
          setPendingFunction('');
          setDisplay('0');
        } else if (display.length === 1) {
          setDisplay('0');
        } else {
          setDisplay(display.slice(0, -1));
        }
        break;
      
      case '=':
        if (isFunctionMode && pendingFunction) {
          // Jika dalam mode fungsi, hitung hasil fungsi
          calculateFunctionResult();
        } else {
          calculateResult();
        }
        break;
      
      case '+':
      case '-':
      case '×':
      case '÷':
        if (isFunctionMode) {
          // Jika dalam mode fungsi, batalkan mode fungsi terlebih dahulu
          setIsFunctionMode(false);
          setPendingFunction('');
        }
        setExpression(expression + display + value);
        setCurrentOperation(`${display} ${value}`);
        setDisplay('0');
        break;
      
      case '±':
        if (display === '0') break;
        setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
        break;
      
      case '.':
        if (!display.includes('.')) {
          setDisplay(display + '.');
        }
        break;
      
      // Memory functions
      case 'MC':
        setMemory(0);
        setCurrentOperation('Memory Cleared');
        setTimeout(() => setCurrentOperation(''), 2000);
        break;
      
      case 'MR':
        setDisplay(memory.toString());
        setCurrentOperation(`Memory Recall: ${memory}`);
        setTimeout(() => setCurrentOperation(''), 2000);
        break;
      
      case 'M+':
        if (!isNaN(parseFloat(display))) {
          setMemory(memory + parseFloat(display));
          setCurrentOperation(`Memory Added: ${display}`);
          setTimeout(() => setCurrentOperation(''), 2000);
        }
        break;
      
      case 'M-':
        if (!isNaN(parseFloat(display))) {
          setMemory(memory - parseFloat(display));
          setCurrentOperation(`Memory Subtracted: ${display}`);
          setTimeout(() => setCurrentOperation(''), 2000);
        }
        break;
      
      // Scientific functions
      case 'sin':
      case 'cos':
      case 'tan':
        if (isShift) {
          handleInverseTrigFunction(value);
        } else {
          handleTrigFunction(value);
        }
        break;
      
      case 'log':
        if (isShift) {
          setDisplay((10 ** parseFloat(display)).toString());
          setCurrentOperation(`10^${display}`);
        } else {
          handleFunction('log', 'log');
        }
        break;
      
      case 'ln':
        if (isShift) {
          setDisplay((Math.exp(parseFloat(display))).toString());
          setCurrentOperation(`e^${display}`);
        } else {
          handleFunction('ln', 'ln');
        }
        break;
      
      case '√':
        if (isShift) {
          setDisplay((parseFloat(display) ** 2).toString());
          setCurrentOperation(`(${display})²`);
        } else {
          handleFunction('√', '√');
        }
        break;
      
      case 'x²':
        setDisplay((parseFloat(display) ** 2).toString());
        setCurrentOperation(`(${display})²`);
        break;
      
      case 'x³':
        setDisplay((parseFloat(display) ** 3).toString());
        setCurrentOperation(`(${display})³`);
        break;
      
      case 'x^y':
        setExpression(display + '^');
        setCurrentOperation(`${display}^`);
        setDisplay('0');
        break;
      
      case '1/x':
        if (parseFloat(display) !== 0) {
          setDisplay((1 / parseFloat(display)).toString());
          setCurrentOperation(`1/(${display})`);
        } else {
          setDisplay('Error');
        }
        break;
      
      case '|x|':
        setDisplay(Math.abs(parseFloat(display)).toString());
        setCurrentOperation(`|${display}|`);
        break;
      
      case 'n!':
        const num = parseInt(display);
        if (num >= 0 && num <= 20) {
          setDisplay(factorial(num).toString());
          setCurrentOperation(`${display}!`);
        } else {
          setDisplay('Error');
        }
        break;
      
      case 'π':
        setDisplay('3.14159265359');
        setCurrentOperation('π');
        setTimeout(() => setCurrentOperation(''), 1500);
        break;
      
      case 'e':
        setDisplay('2.71828182846');
        setCurrentOperation('e');
        setTimeout(() => setCurrentOperation(''), 1500);
        break;
      
      case 'RAD':
      case 'DEG':
        setIsRad(!isRad);
        setCurrentOperation(isRad ? 'Switched to DEG' : 'Switched to RAD');
        setTimeout(() => setCurrentOperation(''), 1500);
        break;
      
      case 'shift':
        setIsShift(!isShift);
        setCurrentOperation(isShift ? 'Shift OFF' : 'Shift ON');
        setTimeout(() => setCurrentOperation(''), 1500);
        break;

      case 'FORMULA':
        setShowFormula(!showFormula);
        break;
      
      default:
        // Handle numbers (0-9)
        if (isFunctionMode) {
          // Jika dalam mode fungsi, masukkan angka ke dalam fungsi
          if (display === '0') {
            setDisplay(value);
          } else {
            setDisplay(display + value);
          }
        } else {
          // Normal number input
          if (display === '0') {
            setDisplay(value);
          } else {
            setDisplay(display + value);
          }
        }
        break;
    }
  };

  // Fungsi baru untuk menangani fungsi trigonometri dengan format sin()
  const handleTrigFunction = (func) => {
    setIsFunctionMode(true);
    setPendingFunction(func);
    setCurrentOperation(`${func}(`);
    setDisplay('0'); // Reset display untuk memasukkan angka baru
  };

  // Fungsi baru untuk menghitung hasil fungsi
const calculateFunctionResult = () => {
  if (!isFunctionMode || !pendingFunction) return;

  const value = parseFloat(display);
  if (isNaN(value)) return;
  
  let result;
  const radValue = isRad ? value : value * Math.PI / 180;
  
  switch (pendingFunction) {
    case 'sin': 
      result = Math.sin(radValue); 
      break;
    case 'cos': 
      result = Math.cos(radValue); 
      break;
    case 'tan': 
      result = Math.tan(radValue); 
      break;
    case 'log': 
      result = Math.log10(value); 
      break;
    case 'ln': 
      result = Math.log(value); 
      break;
    case '√': 
      result = Math.sqrt(value); 
      break;
    default: 
      return;
  }
  
  // Fix precision issues for common values
  result = fixPrecision(result, value, pendingFunction, isRad);
  
  setDisplay(result.toString());
  setCurrentOperation(`${pendingFunction}(${value})`);
  setIsFunctionMode(false);
  setPendingFunction('');
};

// Fungsi untuk memperbaiki presisi nilai-nilai umum
const fixPrecision = (result, inputValue, func, radMode) => {
  // Jika dalam mode derajat, periksa nilai-nilai umum
  if (!radMode) {
    // Untuk fungsi trigonometri dengan input derajat
    if (func === 'sin' || func === 'cos' || func === 'tan') {
      // Nilai-nilai umum yang seharusnya menghasilkan hasil eksak
      const commonValues = [0, 30, 45, 60, 90, 180, 270, 360];
      const tolerance = 1e-10;
      
      // Cek jika inputValue mendekati nilai umum
      for (const commonValue of commonValues) {
        if (Math.abs(inputValue - commonValue) < tolerance) {
          const exactValue = commonValue;
          return getExactTrigValue(func, exactValue);
        }
      }
    }
  }
  
  // Untuk nilai lainnya, bulatkan untuk menghindari floating point errors
  return roundToPrecision(result, 12);
};

// Fungsi untuk mendapatkan nilai trigonometri eksak
const getExactTrigValue = (func, degrees) => {
  switch (func) {
    case 'sin':
      switch (degrees) {
        case 0: return 0;
        case 30: return 0.5;
        case 45: return Math.SQRT2 / 2;
        case 60: return Math.sqrt(3) / 2;
        case 90: return 1;
        case 180: return 0;
        case 270: return -1;
        case 360: return 0;
        default: return Math.sin(degrees * Math.PI / 180);
      }
    case 'cos':
      switch (degrees) {
        case 0: return 1;
        case 30: return Math.sqrt(3) / 2;
        case 45: return Math.SQRT2 / 2;
        case 60: return 0.5;
        case 90: return 0;
        case 180: return -1;
        case 270: return 0;
        case 360: return 1;
        default: return Math.cos(degrees * Math.PI / 180);
      }
    case 'tan':
      switch (degrees) {
        case 0: return 0;
        case 30: return 1 / Math.sqrt(3);
        case 45: return 1;
        case 60: return Math.sqrt(3);
        case 90: return Infinity;
        case 180: return 0;
        case 270: return Infinity;
        case 360: return 0;
        default: return Math.tan(degrees * Math.PI / 180);
      }
    default:
      return 0;
  }
};

// Fungsi untuk membulatkan angka dengan presisi tertentu
const roundToPrecision = (number, precision) => {
  if (!isFinite(number)) return number;
  const factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
};

  // Fungsi untuk inverse trigonometri (tetap seperti semula)
  const handleInverseTrigFunction = (func) => {
    const value = parseFloat(display);
    if (isNaN(value)) return;
    
    let result;
    const inverseFunc = func === 'sin' ? 'asin' : func === 'cos' ? 'acos' : 'atan';
    
    switch (inverseFunc) {
      case 'asin': result = Math.asin(value); break;
      case 'acos': result = Math.acos(value); break;
      case 'atan': result = Math.atan(value); break;
      default: return;
    }
    
    // Convert to degrees if not in radian mode
    if (!isRad) {
      result = result * 180 / Math.PI;
    }
    
    setDisplay(result.toString());
    setCurrentOperation(`${func}⁻¹(${value})`);
  };

  // Fungsi untuk fungsi umum (log, ln, √)
  const handleFunction = (func, displayName) => {
    setIsFunctionMode(true);
    setPendingFunction(func);
    setCurrentOperation(`${displayName}(`);
    setDisplay('0');
  };

  const calculateResult = () => {
    try {
      let expr = expression + display;
      
      console.log('Calculating:', expr);
      
      // Replace symbols
      expr = expr.replace(/×/g, '*').replace(/÷/g, '/');
      expr = expr.replace(/π/g, Math.PI.toString());
      expr = expr.replace(/e/g, Math.E.toString());
      
      // Handle power operator
      expr = expr.replace(/\^/g, '**');
      
      // Simple evaluation untuk menghindari kompleksitas
      const result = Function('"use strict"; return (' + expr + ')')();
      
      setDisplay(result.toString());
      setExpression('');
      setCurrentOperation(`${expr} = ${result}`);
    } catch (error) {
      console.error('Calculation error:', error);
      setDisplay('Error');
      setExpression('');
    }
  };

  const factorial = (n) => {
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e) => {
      const key = e.key;
      
      if (key >= '0' && key <= '9') {
        handleButtonClick(key);
      } else if (key === '+') {
        handleButtonClick('+');
      } else if (key === '-') {
        handleButtonClick('-');
      } else if (key === '*') {
        handleButtonClick('×');
      } else if (key === '/') {
        e.preventDefault();
        handleButtonClick('÷');
      } else if (key === 'Enter' || key === '=') {
        handleButtonClick('=');
      } else if (key === 'Escape') {
        handleButtonClick('C');
      } else if (key === 'Backspace') {
        handleButtonClick('DEL');
      } else if (key === '.') {
        handleButtonClick('.');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [display, expression, isRad, isShift, isFunctionMode, pendingFunction]);

  const CalcButton = ({ value, displayText, className = '' }) => (
    <button
      className={`flex items-center justify-center p-3 text-sm font-medium rounded-lg transition-all duration-200 active:scale-95 hover:opacity-90 ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        handleButtonClick(value);
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {displayText || value}
    </button>
  );

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      {/* Display Area yang Diperluas */}
      <div className="bg-gray-900 rounded-lg p-4 mb-4">
        {/* Formula/Operation Display */}
        {showFormula && (
          <div className="text-gray-300 text-sm h-6 flex justify-between items-center mb-2">
            <span className="truncate flex-1 mr-2 text-xs font-mono">
              {isFunctionMode ? `${pendingFunction}(${display})` : currentOperation || expression}
            </span>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {memory !== 0 && <span className="text-green-400 text-xs bg-green-900 px-1 rounded">M</span>}
              <span className={`px-2 py-1 rounded text-xs ${isRad ? 'bg-blue-500' : 'bg-purple-500'}`}>
                {isRad ? 'RAD' : 'DEG'}
              </span>
              {isShift && <span className="text-yellow-400 text-xs bg-yellow-900 px-1 rounded">SHIFT</span>}
              {isFunctionMode && <span className="text-blue-400 text-xs bg-blue-900 px-1 rounded">FUNC</span>}
            </div>
          </div>
        )}
        
        {/* Main Display */}
        <div className="text-white text-3xl font-mono text-right truncate">
          {isFunctionMode ? `${pendingFunction}(${display})` : display}
        </div>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-5 gap-2">
        {/* Row 1 - Tombol Kontrol */}
        <CalcButton value="FORMULA" displayText={showFormula ? "Hide" : "Show"} 
          className={showFormula ? "bg-green-600 text-white" : "bg-gray-700 text-white"} />
        <CalcButton value="shift" displayText="shift" 
          className={isShift ? "bg-yellow-500 text-gray-900" : "bg-gray-700 text-white"} />
        <CalcButton value="DEG" displayText={isRad ? "DEG" : "RAD"} 
          className="bg-gray-700 text-white" />
        <CalcButton value="sin" displayText={isShift ? "sin⁻¹" : "sin"} 
          className="bg-gray-700 text-white" />
        <CalcButton value="cos" displayText={isShift ? "cos⁻¹" : "cos"} 
          className="bg-gray-700 text-white" />

        {/* Row 2 */}
        <CalcButton value="tan" displayText={isShift ? "tan⁻¹" : "tan"} 
          className="bg-gray-700 text-white" />
        <CalcButton value="MC" className="bg-red-500 text-white" />
        <CalcButton value="MR" className="bg-gray-700 text-white" />
        <CalcButton value="M+" className="bg-gray-700 text-white" />
        <CalcButton value="M-" className="bg-gray-700 text-white" />

        {/* Row 3 */}
        <CalcButton value="DEL" className="bg-red-500 text-white" />
        <CalcButton value="x^y" displayText="x^y" className="bg-gray-700 text-white" />
        <CalcButton value="x²" className="bg-gray-700 text-white" />
        <CalcButton value="x³" className="bg-gray-700 text-white" />
        <CalcButton value="√" displayText="√" className="bg-gray-700 text-white" />

        {/* Row 4 */}
        <CalcButton value="log" displayText={isShift ? "10^x" : "log"} className="bg-gray-700 text-white" />
        <CalcButton value="ln" displayText={isShift ? "e^x" : "ln"} className="bg-gray-700 text-white" />
        <CalcButton value="π" className="bg-gray-700 text-white" />
        <CalcButton value="e" className="bg-gray-700 text-white" />
        <CalcButton value="n!" className="bg-gray-700 text-white" />

        {/* Row 5 */}
        <CalcButton value="1/x" className="bg-gray-700 text-white" />
        <CalcButton value="CE" className="bg-orange-500 text-white" />
        <CalcButton value="C" className="bg-orange-500 text-white" />
        <CalcButton value="±" className="bg-gray-700 text-white" />
        <CalcButton value="÷" className="bg-orange-500 text-white" />

        {/* Row 6 */}
        <CalcButton value="7" className="bg-gray-600 text-white hover:bg-gray-500" />
        <CalcButton value="8" className="bg-gray-600 text-white hover:bg-gray-500" />
        <CalcButton value="9" className="bg-gray-600 text-white hover:bg-gray-500" />
        <CalcButton value="×" className="bg-orange-500 text-white" />
        <CalcButton value="|x|" className="bg-gray-700 text-white" />

        {/* Row 7 */}
        <CalcButton value="4" className="bg-gray-600 text-white hover:bg-gray-500" />
        <CalcButton value="5" className="bg-gray-600 text-white hover:bg-gray-500" />
        <CalcButton value="6" className="bg-gray-600 text-white hover:bg-gray-500" />
        <CalcButton value="-" className="bg-orange-500 text-white" />
        <CalcButton value="=" className="bg-green-500 text-white row-span-2 text-xl" />

        {/* Row 8 */}
        <CalcButton value="1" className="bg-gray-600 text-white hover:bg-gray-500" />
        <CalcButton value="2" className="bg-gray-600 text-white hover:bg-gray-500" />
        <CalcButton value="3" className="bg-gray-600 text-white hover:bg-gray-500" />
        <CalcButton value="+" className="bg-orange-500 text-white" />

        {/* Row 9 */}
        <CalcButton value="0" className="bg-gray-600 text-white hover:bg-gray-500 col-span-2" />
        <CalcButton value="." className="bg-gray-600 text-white hover:bg-gray-500" />
      </div>

      {/* Status Bar */}
      <div className="mt-3 text-xs text-gray-400 text-center">
        {showFormula ? "Formula display: ON" : "Formula display: OFF"}
        {isFunctionMode && " | Function mode: ON"}
      </div>
    </div>
  );
};

export default Calculator;