// components/DonutChart.jsx - Perfect centering version
import React from 'react';

const DonutChart = ({ 
  percentage, 
  size = 40, 
  strokeWidth = 4, 
  className = '',
  showPercentage = true,
  percentagePosition = 'inside'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (percent) => {
    if (percent >= 80) return '#10B981';
    if (percent >= 60) return '#F59E0B';
    if (percent >= 40) return '#F97316';
    return '#EF4444';
  };

  const strokeColor = getColor(percentage);

  // Calculate optimal font size based on chart size
  const getFontSize = () => {
    if (size <= 30) return 10;
    if (size <= 40) return 12;
    if (size <= 50) return 14;
    return 16;
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90 absolute">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#FFFFFF"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        
        {/* Perfectly centered text */}
        {showPercentage && percentagePosition === 'inside' && (
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            <div className="text-center transform translate-y-0">
              <span 
                className="font-bold block leading-none"
                style={{ 
                  color: strokeColor,
                  fontSize: getFontSize(),
                  lineHeight: 1
                }}
              >
                {percentage}%
              </span>
            </div>
          </div>
        )}
      </div>
      
      {showPercentage && percentagePosition === 'outside' && (
        <span 
          className="font-semibold text-gray-800 whitespace-nowrap ml-2"
          style={{ 
            color: strokeColor,
            fontSize: getFontSize()
          }}
        >
          {percentage}%
        </span>
      )}
    </div>
  );
};

export default DonutChart;