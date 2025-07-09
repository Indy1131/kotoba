import { useState, useRef, useEffect } from "react";
import Button from "../components/Button";
import Chip from "../components/Chip";
import { audioService } from "../services/audioService";
import type { FormantResponse, FormantPlotData } from "../services/audioService";
import useUser from "../providers/user/useUser";

interface FormantPlotProps {
  plotData: FormantPlotData | null;
  speakerType: string;
}

function FormantPlot({ plotData, speakerType }: FormantPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!plotData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const { plot_config, reference_vowels, user_points } = plotData;
    const [f1Min, f1Max] = plot_config.f1_range;
    const [f2Min, f2Max] = plot_config.f2_range;

    // Set up coordinate transformation
    const margin = 40;
    const plotWidth = width - 2 * margin;
    const plotHeight = height - 2 * margin;

    const f1ToY = (f1: number) => {
      const normalized = plot_config.invert_axes 
        ? (f1Max - f1) / (f1Max - f1Min)
        : (f1 - f1Min) / (f1Max - f1Min);
      return margin + normalized * plotHeight;
    };

    const f2ToX = (f2: number) => {
      const normalized = plot_config.invert_axes 
        ? (f2Max - f2) / (f2Max - f2Min)
        : (f2 - f2Min) / (f2Max - f2Min);
      return margin + normalized * plotWidth;
    };

    // Draw axes
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 1;
    
    // Vertical axis (F1)
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, height - margin);
    ctx.stroke();
    
    // Horizontal axis (F2)
    ctx.beginPath();
    ctx.moveTo(margin, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = '#666';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    
    // F2 label (bottom)
    ctx.fillText('F2 (Hz)', width / 2, height - 10);
    
    // F1 label (left, rotated)
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('F1 (Hz)', 0, 0);
    ctx.restore();

    // Draw reference vowels
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#9ca3af';
    
    reference_vowels.forEach(({ vowel, f1, f2 }) => {
      const x = f2ToX(f2);
      const y = f1ToY(f1);
      
      // Draw reference point
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw vowel symbol
      ctx.fillText(vowel, x, y - 15);
    });

    // Log detected user points coordinates
    if (user_points.length > 0) {
      console.log('User formant coordinates:', user_points.map(p => ({ f1: p.f1, f2: p.f2 })));
    }
    // Draw user formant trajectory
    if (user_points.length > 0) {
      // Draw trajectory line
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      user_points.forEach((point, i) => {
        const x = f2ToX(point.f2);
        const y = f1ToY(point.f1);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Draw user points with color coding
      user_points.forEach((point, _i) => {
        const x = f2ToX(point.f2);
        const y = f1ToY(point.f1);
        
        // Color based on confidence or time
        const alpha = Math.max(0.3, 1 - point.confidence / 200); // Fade with distance
        ctx.fillStyle = `rgba(37, 99, 235, ${alpha})`;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Draw axis ticks and labels
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    // F2 ticks (bottom)
    for (let f2 = f2Min; f2 <= f2Max; f2 += 500) {
      const x = f2ToX(f2);
      ctx.beginPath();
      ctx.moveTo(x, height - margin);
      ctx.lineTo(x, height - margin + 5);
      ctx.stroke();
      ctx.fillText(f2.toString(), x, height - margin + 18);
    }

    // F1 ticks (left)
    ctx.textAlign = 'right';
    for (let f1 = f1Min; f1 <= f1Max; f1 += 100) {
      const y = f1ToY(f1);
      ctx.beginPath();
      ctx.moveTo(margin - 5, y);
      ctx.lineTo(margin, y);
      ctx.stroke();
      ctx.fillText(f1.toString(), margin - 8, y + 4);
    }

  }, [plotData, speakerType]);

  if (!plotData) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Record audio to see formant analysis</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="w-full h-96 border border-gray-200 rounded-lg bg-white"
      />
    </div>
  );
}

export default function FormantAnalysis() {
  const { user } = useUser();
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formantData, setFormantData] = useState<FormantResponse | null>(null);
  const [speakerType, setSpeakerType] = useState<'male' | 'female' | 'child'>('male');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Check backend status on component mount
  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      await audioService.healthCheck();
      setBackendStatus('available');
    } catch (error) {
      console.warn('Backend not available:', error);
      setBackendStatus('unavailable');
    }
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: false, // Disable for better formant analysis
          echoCancellation: false,
          autoGainControl: false,
          sampleRate: 16000,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    setIsRecording(false);
    setIsAnalyzing(true);

    mediaRecorderRef.current.stop();

    mediaRecorderRef.current.onstop = async () => {
      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = await audioService.convertToWav(audioBlob);

        // Analyze formants
        const result = await audioService.analyzeFormants(audioFile, speakerType);
        setFormantData(result);

      } catch (error) {
        console.error('Error analyzing formants:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };
  };

  if (!user) {
    return <h1>Please log in to access formant analysis</h1>;
  }

  if (backendStatus === 'unavailable') {
    return (
      <div className="flex w-full h-full flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-negative mb-4">Backend Unavailable</h1>
        <p className="text-gray-600">Please start the Python backend server to use formant analysis.</p>
        <Button 
          text="Retry Connection" 
          onClick={checkBackendStatus}
          className="mt-4"
        />
      </div>
    );
  }

  return (
    <div className="flex w-full h-full flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Formant Analysis</h1>
          <p className="text-gray-600">Visualize vowel formants and pronunciation patterns</p>
        </div>
        
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-gray-700">Speaker Type:</label>
          <select
            value={speakerType}
            onChange={(e) => setSpeakerType(e.target.value as 'male' | 'female' | 'child')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            disabled={isRecording || isAnalyzing}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="child">Child</option>
          </select>
        </div>
      </div>

      {/* Control Panel */}
      <div className="flex gap-4 items-center justify-center bg-cardback p-4 rounded-2xl border-1 border-outline">
        <Button
          text={isRecording ? "Recording..." : "Start Recording"}
          icon="record.svg"
          onClick={startRecording}
          disabled={isRecording || isAnalyzing || backendStatus !== 'available'}
          accent={isRecording ? "red" : "green"}
          className="px-6"
        />
        
        <Button
          text="Stop Recording"
          icon="stop.svg"
          onClick={stopRecording}
          disabled={!isRecording || isAnalyzing}
          accent="red"
          className="px-6"
        />

        {isAnalyzing && (
          <div className="flex items-center gap-2 text-primary">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm">Analyzing formants...</span>
          </div>
        )}
      </div>

      {/* Formant Plot */}
      <div className="flex-1 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Vowel Formant Plot</h2>
        <FormantPlot 
          plotData={formantData?.plot_data || null} 
          speakerType={speakerType}
        />
      </div>

      {/* Results Panel */}
      {formantData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-highlight p-4 rounded-lg">
              <h3 className="font-medium text-primary mb-2">Primary Vowel</h3>
              <div className="text-2xl font-bold">/{formantData.formant_analysis.primary_vowel}/</div>
            </div>
            
            <div className="bg-highlight p-4 rounded-lg">
              <h3 className="font-medium text-primary mb-2">Duration</h3>
              <div className="text-2xl font-bold">
                {formantData.formant_analysis.duration.toFixed(2)}s
              </div>
            </div>
            
            <div className="bg-highlight p-4 rounded-lg">
              <h3 className="font-medium text-primary mb-2">Frames Analyzed</h3>
              <div className="text-2xl font-bold">
                {formantData.formant_analysis.total_frames}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-medium text-primary mb-2">Vowel Distribution</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(formantData.formant_analysis.vowel_distribution).map(([vowel, count]) => (
                <Chip 
                  key={vowel}
                  text={`/${vowel}/ (${count})`}
                  accent={vowel === formantData.formant_analysis.primary_vowel ? "green" : "default"}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
