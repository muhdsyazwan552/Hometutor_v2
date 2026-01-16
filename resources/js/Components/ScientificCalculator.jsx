import React, { useState } from 'react';
import { evaluate, sqrt, sin, cos, tan, log, pi, e, pow, abs, mean, std, factorial, combinations, permutations } from 'mathjs';

const ScientificCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [memory, setMemory] = useState(0);
  const [isRad, setIsRad] = useState(true);
  const [history, setHistory] = useState([]);
  const [activeMode, setActiveMode] = useState('main'); // 'main' or 'function'
  const [ans, setAns] = useState(null);

  // Mode buttons - only main and function
  const modeButtons = [
    { id: 'main', label: 'main', className: 'bg-blue-600 text-white' },
    { id: 'function', label: 'func', className: 'bg-gray-600 text-white' },
  ];

  // Main mode buttons (basic operations) - 8 columns, 4 rows
  const mainButtons = [
    // Row 1
    { value: '7', className: 'bg-gray-600 text-white hover:bg-gray-500' },
    { value: '8', className: 'bg-gray-600 text-white hover:bg-gray-500' },
    { value: '9', className: 'bg-gray-600 text-white hover:bg-gray-500' },
    { value: '÷', displayText: '÷', className: 'bg-orange-500 text-white hover:bg-orange-600' },
    { value: 'x²', displayText: 'a²', className: 'bg-blue-700 text-white hover:bg-blue-800' },
    { value: 'x^y', displayText: 'aᵇ', className: 'bg-blue-700 text-white hover:bg-blue-800' },
    { value: 'a/b', displayText: 'a/b', className: 'bg-blue-700 text-white hover:bg-blue-800' },
    { value: 'Check', displayText: '=', className: 'bg-green-600 text-white hover:bg-green-700' },
    
    // Row 2
    { value: '4', className: 'bg-gray-600 text-white hover:bg-gray-500' },
    { value: '5', className: 'bg-gray-600 text-white hover:bg-gray-500' },
    { value: '6', className: 'bg-gray-600 text-white hover:bg-gray-500' },
    { value: '×', displayText: '×', className: 'bg-orange-500 text-white hover:bg-orange-600' },
    { value: '√', displayText: '√', className: 'bg-blue-700 text-white hover:bg-blue-800' },
    { value: '³√', displayText: '³√', className: 'bg-blue-700 text-white hover:bg-blue-800' },
    { value: '(', className: 'bg-blue-700 text-white hover:bg-blue-800' },
    { value: ')', className: 'bg-blue-700 text-white hover:bg-blue-800' },
    
    // Row 3
    { value: '1', className: 'bg-gray-600 text-white hover:bg-gray-500' },
    { value: '2', className: 'bg-gray-600 text-white hover:bg-gray-500' },
    { value: '3', className: 'bg-gray-600 text-white hover:bg-gray-500' },
    { value: '-', displayText: '−', className: 'bg-orange-500 text-white hover:bg-orange-600' },
    { value: 'sin', className: 'bg-blue-700 text-white hover:bg-blue-800' },
    { value: 'cos', className: 'bg-blue-700 text-white hover:bg-blue-800' },
    { value: 'tan', className: 'bg-blue-700 text-white hover:bg-blue-800' },
    { value: 'π', className: 'bg-blue-700 text-white hover:bg-blue-800' },
    
    // Row 4
    { value: '0', className: 'bg-gray-600 text-white hover:bg-gray-500' },
    { value: '.', className: 'bg-gray-600 text-white hover:bg-gray-500' },
    { value: 'ans', displayText: 'ans', className: 'bg-gray-600 text-white hover:bg-gray-500' },
    { value: '+', className: 'bg-orange-500 text-white hover:bg-orange-600' },
    { value: 'abs', displayText: '|a|', className: 'bg-blue-700 text-white hover:bg-blue-800' },
    { value: 'ln', className: 'bg-blue-700 text-white hover:bg-blue-800' },
    { value: ',', className: 'bg-blue-700 text-white hover:bg-blue-800' },
    { value: '±', displayText: '−', className: 'bg-blue-700 text-white hover:bg-blue-800' },
  ];

  // Function mode buttons (scientific operations) - 6 columns, 5 rows
  const functionButtons = [
    // Row 1
    { value: 'sin', displayText: 'sin', className: 'bg-purple-700 text-white hover:bg-purple-800' },
    { value: 'cos', displayText: 'cos', className: 'bg-purple-700 text-white hover:bg-purple-800' },
    { value: 'tan', displayText: 'tan', className: 'bg-purple-700 text-white hover:bg-purple-800' },
    { value: 'ln', displayText: 'ln', className: 'bg-purple-700 text-white hover:bg-purple-800' },
    { value: 'log', displayText: 'log', className: 'bg-purple-700 text-white hover:bg-purple-800' },
    { value: 'empty', displayText: '', className: 'bg-transparent cursor-default' },
    
    // Row 2
    { value: 'asin', displayText: 'sin⁻¹', className: 'bg-blue-700 text-white hover:bg-blue-800' },
    { value: 'acos', displayText: 'cos⁻¹', className: 'bg-blue-700 text-white hover:bg-blue-800' },
    { value: 'atan', displayText: 'tan⁻¹', className: 'bg-blue-700 text-white hover:bg-blue-800' },
    { value: 'e^x', displayText: 'eˣ', className: 'bg-blue-700 text-white hover:bg-blue-800' },
    { value: 'abs', displayText: 'abs', className: 'bg-blue-700 text-white hover:bg-blue-800' },
    { value: 'round', displayText: 'round', className: 'bg-blue-700 text-white hover:bg-blue-800' },
    
    // Row 3
    { value: 'mean', displayText: 'mean', className: 'bg-green-700 text-white hover:bg-green-800' },
    { value: 'stdev', displayText: 'stdev', className: 'bg-green-700 text-white hover:bg-green-800' },
    { value: 'stdevp', displayText: 'stdevp', className: 'bg-green-700 text-white hover:bg-green-800' },
    { value: 'x^y', displayText: 'aᵇ', className: 'bg-green-700 text-white hover:bg-green-800' },
    { value: '√', displayText: '√', className: 'bg-green-700 text-white hover:bg-green-800' },
    { value: '³√', displayText: '³√', className: 'bg-green-700 text-white hover:bg-green-800' },
    
    // Row 4
    { value: 'nPr', displayText: 'nPr', className: 'bg-indigo-700 text-white hover:bg-indigo-800' },
    { value: 'nCr', displayText: 'nCr', className: 'bg-indigo-700 text-white hover:bg-indigo-800' },
    { value: '!', displayText: '!', className: 'bg-indigo-700 text-white hover:bg-indigo-800' },
    { value: 'e', displayText: 'e', className: 'bg-indigo-700 text-white hover:bg-indigo-800' },
    { value: 'π', displayText: 'π', className: 'bg-indigo-700 text-white hover:bg-indigo-800' },
    { value: 'down', displayText: '↓', className: 'bg-gray-700 text-white hover:bg-gray-800' },
  ];

  const handleButtonClick = (value) => {
    if (value === 'empty') return;
    
    switch(value) {
      case 'C':
      case 'clear all':
        setDisplay('0');
        setExpression('');
        break;
        
      case 'CE':
        setDisplay('0');
        break;
        
      case 'DEL':
        if (display.length === 1) {
          setDisplay('0');
        } else {
          setDisplay(display.slice(0, -1));
        }
        break;
        
      case 'Check':
      case '=':
        calculateResult();
        break;
        
      case 'sin':
      case 'cos':
      case 'tan':
      case 'asin':
      case 'acos':
      case 'atan':
        handleTrigFunction(value);
        break;
        
      case 'log':
        setDisplay(`log(${display})`);
        setExpression(`log10(${display})`);
        break;
        
      case 'ln':
        setDisplay(`ln(${display})`);
        setExpression(`log(${display})`);
        break;
        
      case 'e^x':
        setDisplay(`e^(${display})`);
        setExpression(`exp(${display})`);
        break;
        
      case '√':
        setDisplay(`√(${display})`);
        setExpression(`sqrt(${display})`);
        break;
        
      case '³√':
        setDisplay(`³√(${display})`);
        setExpression(`cbrt(${display})`);
        break;
        
      case 'x²':
        setDisplay(`(${display})²`);
        setExpression(`(${display})^2`);
        break;
        
      case 'x^y':
        setDisplay(`${display}^`);
        setExpression(`${display}^`);
        break;
        
      case 'a/b':
        setDisplay(`(${display})/`);
        setExpression(`(${display})/`);
        break;
        
      case 'π':
        setDisplay(Math.PI.toString());
        setExpression('pi');
        break;
        
      case 'e':
        setDisplay(Math.E.toString());
        setExpression('e');
        break;
        
      case 'abs':
        setDisplay(`abs(${display})`);
        setExpression(`abs(${display})`);
        break;
        
      case 'round':
        setDisplay(`round(${display})`);
        setExpression(`round(${display})`);
        break;
        
      case 'mean':
        setDisplay(`mean(${display})`);
        setExpression(`mean(${display})`);
        break;
        
      case 'stdev':
        setDisplay(`stdev(${display})`);
        setExpression(`std(${display})`);
        break;
        
      case 'stdevp':
        setDisplay(`stdevp(${display})`);
        setExpression(`std(${display}, "uncorrected")`);
        break;
        
      case 'nPr':
        setDisplay(`perm(${display})`);
        setExpression(`permutations(${display})`);
        break;
        
      case 'nCr':
        setDisplay(`comb(${display})`);
        setExpression(`combinations(${display})`);
        break;
        
      case '!':
        setDisplay(`factorial(${display})`);
        setExpression(`factorial(${display})`);
        break;
        
      case 'down':
        // Scroll down or show more functions
        break;
        
      case 'ans':
        if (ans !== null) {
          setDisplay(ans.toString());
        }
        break;
        
      case '±':
        if (display !== '0') {
          setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
        }
        break;
        
      case 'RAD':
      case 'DEG':
        setIsRad(!isRad);
        break;
        
      default:
        // Numbers and operators
        if (display === '0') {
          setDisplay(value);
          setExpression(value);
        } else {
          setDisplay(display + value);
          setExpression(expression + value);
        }
        break;
    }
  };

  const handleTrigFunction = (func) => {
    const value = parseFloat(display);
    if (isNaN(value)) return;
    
    let result;
    const radValue = isRad ? value : value * Math.PI / 180;
    
    switch(func) {
      case 'sin': result = sin(radValue); break;
      case 'cos': result = cos(radValue); break;
      case 'tan': result = tan(radValue); break;
      case 'asin': result = Math.asin(radValue); break;
      case 'acos': result = Math.acos(radValue); break;
      case 'atan': result = Math.atan(radValue); break;
      default: return;
    }
    
    const roundedResult = Math.round(result * 1e10) / 1e10;
    setDisplay(roundedResult.toString());
    setExpression(`${func}(${value})`);
    
    setHistory(prev => [...prev, {
      expression: `${func}(${value})`,
      result: roundedResult
    }]);
  };

  const calculateResult = () => {
    try {
      let exprToEval = expression;
      
      exprToEval = exprToEval
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'pi')
        .replace(/√/g, 'sqrt')
        .replace(/³√/g, 'cbrt')
        .replace(/log\(/g, 'log10(')
        .replace(/ln\(/g, 'log(')
        .replace(/abs\(/g, 'abs(')
        .replace(/round\(/g, 'round(')
        .replace(/mean\(/g, 'mean(')
        .replace(/stdev\(/g, 'std(')
        .replace(/stdevp\(/g, 'std(, "uncorrected")')
        .replace(/perm\(/g, 'permutations(')
        .replace(/comb\(/g, 'combinations(')
        .replace(/factorial\(/g, 'factorial(')
        .replace(/e\^/g, 'exp');
      
      const result = evaluate(exprToEval);
      const roundedResult = Math.round(result * 1e10) / 1e10;
      
      setDisplay(roundedResult.toString());
      setAns(roundedResult);
      
      setHistory(prev => [...prev, {
        expression: expression,
        result: roundedResult
      }]);
      
    } catch (error) {
      console.error('Calculation error:', error);
      setDisplay('Error');
    }
  };

  const CalcButton = ({ value, displayText, className = '' }) => (
    <button
      className={`flex items-center justify-center p-2 text-xs font-medium rounded transition-all duration-200 active:scale-95 hover:opacity-90 ${className}`}
      onClick={() => handleButtonClick(value)}
    >
      {displayText || value}
    </button>
  );

  return (
    <div className="bg-gray-900 p-3 rounded-lg shadow-xl w-[500px]">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-white text-sm font-bold">Calculator</div>
        <div className="flex gap-1">
          {modeButtons.map((mode) => (
            <button
              key={mode.id}
              className={`px-3 py-1 text-xs rounded ${mode.className} ${activeMode === mode.id ? 'ring-2 ring-blue-300' : ''}`}
              onClick={() => setActiveMode(mode.id)}
            >
              {mode.label}
            </button>
          ))}
          <button
            className={`px-3 py-1 text-xs rounded ${isRad ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'}`}
            onClick={() => setIsRad(!isRad)}
          >
            {isRad ? 'RAD' : 'DEG'}
          </button>
          <button
            className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
            onClick={() => handleButtonClick('clear all')}
          >
            clear all
          </button>
        </div>
      </div>

      {/* Display */}
      <div className="bg-gray-950 rounded-lg p-3 mb-3">
        <div className="text-gray-400 text-xs mb-1 truncate">Expression: {expression}</div>
        <div className="text-white text-2xl font-mono text-right overflow-x-auto whitespace-nowrap">
          {display}
        </div>
      </div>

      {/* Main Mode (8x4 grid) */}
      {activeMode === 'main' && (
        <div className="grid grid-cols-8 gap-1">
          {mainButtons.map((button, index) => (
            <CalcButton
              key={index}
              value={button.value}
              displayText={button.displayText}
              className={button.className}
            />
          ))}
        </div>
      )}

      {/* Function Mode (6x4 grid) */}
      {activeMode === 'function' && (
        <div className="grid grid-cols-6 gap-1">
          {functionButtons.map((button, index) => (
            <CalcButton
              key={index}
              value={button.value}
              displayText={button.displayText}
              className={button.className}
            />
          ))}
        </div>
      )}

      {/* Bottom Status Bar */}
      <div className="mt-3 pt-2 border-t border-gray-700 flex justify-between items-center">
        <div className="text-gray-400 text-xs">
          Memory: {memory} | Ans: {ans !== null ? ans : '--'}
        </div>
        <details className="text-gray-300 relative">
          <summary className="text-xs cursor-pointer hover:text-white">
            History ({history.length})
          </summary>
          <div className="absolute right-0 mt-1 bg-gray-800 rounded p-2 max-h-32 overflow-y-auto text-xs w-48 z-10 shadow-lg">
            {history.slice().reverse().map((item, index) => (
              <div key={index} className="text-gray-300 border-b border-gray-700 py-1">
                <div className="truncate">{item.expression}</div>
                <div className="text-green-400">= {item.result}</div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
};

export default ScientificCalculator;