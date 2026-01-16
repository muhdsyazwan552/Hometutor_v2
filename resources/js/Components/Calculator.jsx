import React, { useState, useEffect } from 'react';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [memory, setMemory] = useState(0);
  const [isRad, setIsRad] = useState(true);
  const [isShift, setIsShift] = useState(false);
  const [showFormula, setShowFormula] = useState(true);
  const [currentOperation, setCurrentOperation] = useState('');
  const [isFunctionMode, setIsFunctionMode] = useState(false);
  const [pendingFunction, setPendingFunction] = useState('');

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
          calculateFunctionResult();
        } else {
          calculateResult();
        }
        break;
      
      case '+':
      case '-':
      case '×':
      case '÷':
        handleOperator(value);
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
          console.log('Activating function mode for:', value);
          handleTrigFunction(value);
        }
        break;
      
      case 'log':
        if (isShift) {
          setDisplay((10 ** parseFloat(display)).toString());
          setCurrentOperation(`10^${display}`);
        } else {
          console.log('Activating function mode for: log');
          handleFunction('log', 'log');
        }
        break;
      
      case 'ln':
        if (isShift) {
          setDisplay((Math.exp(parseFloat(display))).toString());
          setCurrentOperation(`e^${display}`);
        } else {
          console.log('Activating function mode for: ln');
          handleFunction('ln', 'ln');
        }
        break;
      
      case '√':
        if (isShift) {
          setDisplay((parseFloat(display) ** 2).toString());
          setCurrentOperation(`(${display})²`);
        } else {
          console.log('Activating function mode for: √');
          handleFunction('√', '√');
        }
        break;
      
      case 'x²':
        const squared = parseFloat(display) ** 2;
        setDisplay(roundToPrecision(squared, 12).toString());
        setCurrentOperation(`(${display})²`);
        break;
      
      case 'x³':
        const cubed = parseFloat(display) ** 3;
        setDisplay(roundToPrecision(cubed, 12).toString());
        setCurrentOperation(`(${display})³`);
        break;
      
      case 'x^y':
        setExpression(display + '^');
        setCurrentOperation(`${display}^`);
        setDisplay('0');
        break;
      
      case '1/x':
        if (parseFloat(display) !== 0) {
          const reciprocal = 1 / parseFloat(display);
          setDisplay(roundToPrecision(reciprocal, 12).toString());
          setCurrentOperation(`1/(${display})`);
        } else {
          setDisplay('Error');
        }
        break;
      
      case '|x|':
        const absolute = Math.abs(parseFloat(display));
        setDisplay(absolute.toString());
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
        setDisplay(Math.PI.toString());
        setCurrentOperation('π');
        setTimeout(() => setCurrentOperation(''), 1500);
        break;
      
      case 'e':
        setDisplay(Math.E.toString());
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
          if (display === '0') {
            setDisplay(value);
          } else {
            setDisplay(display + value);
          }
        } else {
          if (display === '0') {
            setDisplay(value);
          } else {
            setDisplay(display + value);
          }
        }
        break;
    }
  };

  const handleOperator = (operator) => {
    console.log('=== handleOperator DEBUG ===');
    console.log('isFunctionMode:', isFunctionMode);
    console.log('pendingFunction:', pendingFunction);
    console.log('expression before:', expression);
    console.log('display before:', display);
    console.log('operator:', operator);
    
    if (isFunctionMode && pendingFunction) {
      const newExpression = expression + `${pendingFunction}(${display})` + operator;
      console.log('New expression (function mode):', newExpression);
      
      setExpression(newExpression);
      setCurrentOperation(`${pendingFunction}(${display}) ${operator}`);
      setDisplay('0');
      setIsFunctionMode(false);
      setPendingFunction('');
    } else {
      let newExpression;
      
      if (expression.includes('=')) {
        newExpression = display + operator;
      } else {
        newExpression = expression + display + operator;
      }
      
      console.log('New expression (normal mode):', newExpression);
      
      setExpression(newExpression);
      setCurrentOperation(`${display} ${operator}`);
      setDisplay('0');
    }
  };

  const calculateFunctionImmediately = () => {
    const value = parseFloat(display);
    if (isNaN(value)) return null;
    
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
        return null;
    }
    
    return roundToPrecision(result, 12);
  };

  const handleTrigFunction = (func) => {
    setIsFunctionMode(true);
    setPendingFunction(func);
    setCurrentOperation(`${func}(`);
    setDisplay('0');
  };

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
    
    result = roundToPrecision(result, 12);
    
    setDisplay(result.toString());
    setCurrentOperation(`${pendingFunction}(${value})`);
    setIsFunctionMode(false);
    setPendingFunction('');
  };

  const handleInverseTrigFunction = (func) => {
    const value = parseFloat(display);
    if (isNaN(value)) return;
    
    let result;
    const inverseFunc = func === 'sin' ? 'asin' : func === 'cos' ? 'acos' : 'atan';
    
    switch (inverseFunc) {
      case 'asin': 
        result = Math.asin(value); 
        break;
      case 'acos': 
        result = Math.acos(value); 
        break;
      case 'atan': 
        result = Math.atan(value); 
        break;
      default: 
        return;
    }
    
    if (!isRad) {
      result = result * 180 / Math.PI;
    }
    
    result = roundToPrecision(result, 12);
    setDisplay(result.toString());
    setCurrentOperation(`${func}⁻¹(${value})`);
  };

  const handleFunction = (func, displayName) => {
    setIsFunctionMode(true);
    setPendingFunction(func);
    setCurrentOperation(`${displayName}(`);
    setDisplay('0');
  };

  const calculateResult = () => {
    try {
      let exprToCalculate;
      
      if (isFunctionMode && pendingFunction) {
        exprToCalculate = expression + `${pendingFunction}(${display})`;
      } else {
        exprToCalculate = expression + display;
      }
      
      console.log('Raw expression:', exprToCalculate);
      
      const originalExpression = exprToCalculate;
      
      let processedExpr = exprToCalculate;
      
      processedExpr = processedExpr.replace(/(sin|cos|tan)\(([^)]+)\)/g, (match, func, num) => {
        const number = parseFloat(num);
        if (isNaN(number)) return match;
        
        const radValue = isRad ? number : number * Math.PI / 180;
        let result;
        
        switch (func) {
          case 'sin': result = Math.sin(radValue); break;
          case 'cos': result = Math.cos(radValue); break;
          case 'tan': result = Math.tan(radValue); break;
          default: return match;
        }
        
        return roundToPrecision(result, 12).toString();
      });
      
      processedExpr = processedExpr.replace(/(log|ln|√)\(([^)]+)\)/g, (match, func, num) => {
        const number = parseFloat(num);
        if (isNaN(number)) return match;
        
        let result;
        switch (func) {
          case 'log': result = Math.log10(number); break;
          case 'ln': result = Math.log(number); break;
          case '√': result = Math.sqrt(number); break;
          default: return match;
        }
        
        return roundToPrecision(result, 12).toString();
      });
      
      processedExpr = processedExpr.replace(/×/g, '*').replace(/÷/g, '/');
      processedExpr = processedExpr.replace(/\^/g, '**');
      
      console.log('Processed expression:', processedExpr);
      
      const result = Function('"use strict"; return (' + processedExpr + ')')();
      const roundedResult = roundToPrecision(result, 12);
      
      setDisplay(roundedResult.toString());
      setExpression(originalExpression + ' = ' + roundedResult);
      setCurrentOperation(originalExpression + ' = ' + roundedResult);
      
      setIsFunctionMode(false);
      setPendingFunction('');
      
    } catch (error) {
      console.error('Calculation error:', error);
      setDisplay('Error');
      setExpression('');
      setIsFunctionMode(false);
      setPendingFunction('');
    }
  };

  const roundToPrecision = (number, precision) => {
    if (!isFinite(number)) return number;
    const factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  };

  const factorial = (n) => {
    if (n === 0 || n === 1) return 1;
    if (n > 20) return Infinity;
    return n * factorial(n - 1);
  };

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
      <div className="bg-gray-900 rounded-lg p-4 mb-4">
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
        
        <div className="text-white text-3xl font-mono text-right truncate">
          {isFunctionMode ? `${pendingFunction}(${display})` : display}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
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

        <CalcButton value="tan" displayText={isShift ? "tan⁻¹" : "tan"} 
          className="bg-gray-700 text-white" />
        <CalcButton value="MC" className="bg-red-500 text-white" />
        <CalcButton value="MR" className="bg-gray-700 text-white" />
        <CalcButton value="M+" className="bg-gray-700 text-white" />
        <CalcButton value="M-" className="bg-gray-700 text-white" />

        <CalcButton value="DEL" className="bg-red-500 text-white" />
        <CalcButton value="x^y" displayText="x^y" className="bg-gray-700 text-white" />
        <CalcButton value="x²" className="bg-gray-700 text-white" />
        <CalcButton value="x³" className="bg-gray-700 text-white" />
        <CalcButton value="√" displayText="√" className="bg-gray-700 text-white" />

        <CalcButton value="log" displayText={isShift ? "10^x" : "log"} className="bg-gray-700 text-white" />
        <CalcButton value="ln" displayText={isShift ? "e^x" : "ln"} className="bg-gray-700 text-white" />
        <CalcButton value="π" className="bg-gray-700 text-white" />
        <CalcButton value="e" className="bg-gray-700 text-white" />
        <CalcButton value="n!" className="bg-gray-700 text-white" />

        <CalcButton value="1/x" className="bg-gray-700 text-white" />
        <CalcButton value="CE" className="bg-orange-500 text-white" />
        <CalcButton value="C" className="bg-orange-500 text-white" />
        <CalcButton value="±" className="bg-gray-700 text-white" />
        <CalcButton value="÷" className="bg-orange-500 text-white" />

        <CalcButton value="7" className="bg-gray-600 text-white hover:bg-gray-500" />
        <CalcButton value="8" className="bg-gray-600 text-white hover:bg-gray-500" />
        <CalcButton value="9" className="bg-gray-600 text-white hover:bg-gray-500" />
        <CalcButton value="×" className="bg-orange-500 text-white" />
        <CalcButton value="|x|" className="bg-gray-700 text-white" />

        <CalcButton value="4" className="bg-gray-600 text-white hover:bg-gray-500" />
        <CalcButton value="5" className="bg-gray-600 text-white hover:bg-gray-500" />
        <CalcButton value="6" className="bg-gray-600 text-white hover:bg-gray-500" />
        <CalcButton value="-" className="bg-orange-500 text-white" />
        <CalcButton value="=" className="bg-green-500 text-white row-span-2 text-xl" />

        <CalcButton value="1" className="bg-gray-600 text-white hover:bg-gray-500" />
        <CalcButton value="2" className="bg-gray-600 text-white hover:bg-gray-500" />
        <CalcButton value="3" className="bg-gray-600 text-white hover:bg-gray-500" />
        <CalcButton value="+" className="bg-orange-500 text-white" />

        <CalcButton value="0" className="bg-gray-600 text-white hover:bg-gray-500 col-span-2" />
        <CalcButton value="." className="bg-gray-600 text-white hover:bg-gray-500" />
      </div>

      <div className="mt-3 text-xs text-gray-400 text-center">
        {showFormula ? "Formula display: ON" : "Formula display: OFF"}
        {isFunctionMode && " | Function mode: ON"}
      </div>
    </div>
  );
};

export default Calculator;