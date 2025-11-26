// components/MiniLineChart.jsx
import React from 'react';

const MiniLineChart = ({ progressData, width = 60, height = 30 }) => {
  // Simple mock data generator
  const generateData = () => {
    const { average_score = 50, total_sessions = 0 } = progressData || {};
    
    if (total_sessions === 0) return null;
    
    return Array.from({ length: 4 }, (_, i) => {
      const base = average_score;
      const variation = (Math.sin(i * 0.8) * 15) + (Math.random() * 10 - 5);
      return Math.max(10, Math.min(95, Math.round(base + variation)));
    });
  };

  const data = generateData();
  
  if (!data) {
    return <span className="text-gray-400 text-sm">—</span>;
  }

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - 4);
    const y = height - (value / 100) * (height - 4);
    return `${x + 2},${y + 2}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default MiniLineChart;