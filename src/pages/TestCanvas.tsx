import { useRef, useEffect } from 'react';

export default function TestCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const { width, height } = canvas;

    console.log('Drawing test canvas:', width, 'x', height);

    // Clear and draw white background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Draw border
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    // Draw test content
    ctx.fillStyle = 'red';
    ctx.fillRect(50, 50, 100, 100);

    ctx.fillStyle = 'blue';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TEST CANVAS', width / 2, height / 2);

    // Draw test vowel positions
    const testVowels = [
      { vowel: 'i', f1: 270, f2: 2290 },
      { vowel: 'a', f1: 730, f2: 1090 },
      { vowel: 'u', f1: 300, f2: 870 }
    ];

    const margin = 60;
    const plotWidth = width - 2 * margin;
    const plotHeight = height - 2 * margin;

    const f1ToY = (f1: number) => margin + ((800 - f1) / (800 - 200)) * plotHeight;
    const f2ToX = (f2: number) => margin + ((3000 - f2) / (3000 - 600)) * plotWidth;

    ctx.fillStyle = 'green';
    testVowels.forEach(({ vowel, f1, f2 }) => {
      const x = f2ToX(f2);
      const y = f1ToY(f1);
      
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = 'black';
      ctx.fillText(vowel, x, y - 15);
      ctx.fillStyle = 'green';
    });

  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Canvas Test</h2>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="border border-gray-300 rounded-lg bg-white"
      />
    </div>
  );
}
