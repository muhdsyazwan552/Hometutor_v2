// components/PageDrawingTool.jsx
import React, { useRef, useState, useEffect } from 'react';

const PageDrawingTool = ({ isActive, onClose }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ff0000');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState('brush');
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas to cover entire window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Clear with transparency
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [isActive]);

  const startDrawing = (e) => {
    if (!isActive) return;
    
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    const x = e.clientX;
    const y = e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e) => {
    if (!isDrawing || !isActive) return;
    
    const ctx = canvasRef.current.getContext('2d');
    const x = e.clientX;
    const y = e.clientY;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  if (!isActive) return null;

  const colors = [
    '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', 
    '#00ffff', '#ff8800', '#8800ff', '#000000', '#ffffff'
  ];

  return (
    <>
      {/* Drawing Canvas - covers entire screen but draws only where clicked */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="fixed inset-0 pointer-events-auto cursor-crosshair z-40"
        style={{ 
          touchAction: 'none',
          background: 'transparent'
        }}
      />

      {/* Floating Toolbar */}
      <div 
        className="fixed bg-white rounded-xl shadow-2xl border border-gray-300 z-50"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={(e) => {
          if (e.target.closest('button')) return;
          setIsDragging(true);
          const startX = e.clientX - position.x;
          const startY = e.clientY - position.y;
          
          const handleMouseMove = (moveEvent) => {
            setPosition({
              x: moveEvent.clientX - startX,
              y: moveEvent.clientY - startY
            });
          };
          
          const handleMouseUp = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      >
        <div className="p-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Draw on Page</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tools */}
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => setTool('brush')}
              className={`px-3 py-2 rounded-lg ${tool === 'brush' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              ✏️
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`px-3 py-2 rounded-lg ${tool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              🧽
            </button>
          </div>

          {/* Colors */}
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-1">Color:</div>
            <div className="flex flex-wrap gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setBrushColor(color)}
                  className={`w-6 h-6 rounded-full border-2 ${brushColor === color ? 'border-blue-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Brush Size */}
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-1">Size: {brushSize}px</div>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={clearDrawing}
              className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PageDrawingTool;