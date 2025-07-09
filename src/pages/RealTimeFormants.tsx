import { useState, useRef, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import Button from "../components/Button";
import Chip from "../components/Chip";

interface FormantData {
  f1: number;
  f2: number;
  f3?: number;
  vowel: string;
  timestamp: number;
  confidence: number;
}

interface PlotData {
  plot_config: {
    f1_range: [number, number];
    f2_range: [number, number];
    invert_axes: boolean;
  };
  reference_vowels: Array<{
    vowel: string;
    f1: number;
    f2: number;
  }>;
  user_points: Array<{
    f1: number;
    f2: number;
    timestamp: number;
    confidence: number;
  }>;
  current_vowel?: string;
}

interface RealTimeFormantPlotProps {
  plotData: PlotData | null;
  isRecording: boolean;
}

function RealTimeFormantPlot({ plotData, isRecording }: RealTimeFormantPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const drawPlot = useCallback(() => {
    console.log('drawPlot called, plotData:', plotData);
    if (!plotData || !canvasRef.current) {
      console.log('No plot data or canvas ref');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const { width, height } = canvas;
    const { plot_config, reference_vowels, user_points } = plotData;

    console.log('Drawing plot with', reference_vowels.length, 'reference vowels');

    // Clear canvas - use full clear for initial draw, fade for animation
    if (isRecording && user_points && user_points.length > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
    }
    const [f1Min, f1Max] = plot_config.f1_range;
    const [f2Min, f2Max] = plot_config.f2_range;

    // Set up coordinate transformation
    const margin = 60;
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

    // Draw background grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.5;
    
    // Vertical grid lines
    for (let f2 = 800; f2 <= 2800; f2 += 400) {
      const x = f2ToX(f2);
      ctx.beginPath();
      ctx.moveTo(x, margin);
      ctx.lineTo(x, height - margin);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let f1 = 300; f1 <= 700; f1 += 100) {
      const y = f1ToY(f1);
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(width - margin, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
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

    // Draw axis labels and ticks
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    // F2 axis labels
    for (let f2 = 800; f2 <= 2800; f2 += 400) {
      const x = f2ToX(f2);
      ctx.fillText(f2.toString(), x, height - margin + 20);
    }
    
    // F1 axis labels
    ctx.textAlign = 'right';
    for (let f1 = 300; f1 <= 700; f1 += 100) {
      const y = f1ToY(f1);
      ctx.fillText(f1.toString(), margin - 10, y + 5);
    }
    
    // Axis titles
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('F2 (Hz)', width / 2, height - 5);
    
    // F1 label (rotated)
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('F1 (Hz)', 0, 0);
    ctx.restore();

    // Draw reference vowels
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#9ca3af';
    
    console.log('Drawing', reference_vowels.length, 'reference vowels');
    reference_vowels.forEach(({ vowel, f1, f2 }) => {
      const x = f2ToX(f2);
      const y = f1ToY(f1);
      
      console.log(`Vowel ${vowel}: F1=${f1} F2=${f2} -> x=${x} y=${y}`);
      
      // Draw reference point
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw vowel symbol
      ctx.fillStyle = '#666';
      ctx.fillText(vowel, x, y - 20);
      ctx.fillStyle = '#9ca3af';
    });
    
    console.log('Finished drawing reference vowels');

    // Draw user formant trajectory
    if (user_points.length > 0) {
      const currentTime = Date.now() / 1000;
      
      // Draw trajectory with fading effect
      for (let i = 1; i < user_points.length; i++) {
        const prev = user_points[i - 1];
        const curr = user_points[i];
        
        // Calculate age-based alpha (newer points are more opaque)
        const age = currentTime - curr.timestamp;
        const alpha = Math.max(0.1, Math.min(1, 1 - age / 10)); // Fade over 10 seconds
        
        // Color based on confidence
        const confidence = curr.confidence;
        const hue = confidence * 120; // Green for high confidence, red for low
        
        ctx.strokeStyle = `hsla(${hue}, 70%, 50%, ${alpha})`;
        ctx.lineWidth = 2 + confidence * 2; // Thicker lines for higher confidence
        
        ctx.beginPath();
        ctx.moveTo(f2ToX(prev.f2), f1ToY(prev.f1));
        ctx.lineTo(f2ToX(curr.f2), f1ToY(curr.f1));
        ctx.stroke();
      }
      
      // Draw current point (most recent)
      if (user_points.length > 0) {
        const current = user_points[user_points.length - 1];
        const confidence = current.confidence;
        const hue = confidence * 120;
        
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
        ctx.beginPath();
        ctx.arc(f2ToX(current.f2), f1ToY(current.f1), 6 + confidence * 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add glow effect if recording
        if (isRecording) {
          ctx.shadowColor = `hsl(${hue}, 70%, 50%)`;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(f2ToX(current.f2), f1ToY(current.f1), 3, 0, 2 * Math.PI);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    // Continue animation if recording
    if (isRecording) {
      animationRef.current = requestAnimationFrame(drawPlot);
    }
  }, [plotData, isRecording]);

  useEffect(() => {
    drawPlot();
    
    // Force redraw every 2 seconds for debugging
    const interval = setInterval(() => {
      console.log('Forcing redraw...');
      drawPlot();
    }, 2000);
    
    return () => {
      clearInterval(interval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [drawPlot]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="border border-gray-300 rounded-lg bg-white"
      />
      {isRecording && (
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-red-600">Recording</span>
        </div>
      )}
    </div>
  );
}

export default function RealTimeFormants() {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [speakerType, setSpeakerType] = useState<'male' | 'female' | 'child'>('male');
  const [currentFormant, setCurrentFormant] = useState<FormantData | null>(null);
  const [plotData, setPlotData] = useState<PlotData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);

  // Create fallback plot data to always show something
  const createFallbackPlotData = (): PlotData => {
    const maleVowels = {
      'i': [270, 2290], 'ɪ': [390, 1990], 'e': [530, 1840],
      'æ': [660, 1720], 'ɑ': [730, 1090], 'ʌ': [640, 1190],
      'ɔ': [570, 840], 'ʊ': [440, 1020], 'u': [300, 870]
    };
    
    return {
      plot_config: {
        f1_range: [200, 800],
        f2_range: [600, 3000],
        invert_axes: true
      },
      reference_vowels: Object.entries(maleVowels).map(([vowel, [f1, f2]]) => ({
        vowel,
        f1,
        f2
      })),
      user_points: [],
      current_vowel: undefined
    };
  };

  // Initialize with fallback data immediately
  useEffect(() => {
    console.log('Component mounting, setting initial plot data');
    const initialData = createFallbackPlotData();
    setPlotData(initialData);
    console.log('Initial plot data set:', initialData);
  }, []);

  // Initialize socket connection
  useEffect(() => {
    console.log('Initializing socket connection...');
    const socketUrl = window.location.hostname === 'localhost' ? 
      'http://localhost:5001' : 
      `http://${window.location.hostname}:5001`;
    
    console.log('Connecting to:', socketUrl);
    socketRef.current = io(socketUrl);
    
    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setError(null);
      
      // Load initial reference vowels
      loadInitialReferences();
    });
    
    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });
    
    socketRef.current.on('recording_started', (data) => {
      console.log('Recording started:', data);
    });
    
    socketRef.current.on('formant_update', (data) => {
      console.log('Formant update received:', data);
      setCurrentFormant(data.formant_data);
      setPlotData(data.plot_data);
    });
    
    socketRef.current.on('error', (data) => {
      console.error('Socket error:', data);
      setError(data.message);
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Load initial reference vowels when speaker type changes
  useEffect(() => {
    if (isConnected) {
      loadInitialReferences();
    }
  }, [speakerType, isConnected]);

  const loadInitialReferences = async () => {
    try {
      console.log(`Loading references for ${speakerType} speaker...`);
      const response = await fetch(`http://localhost:5001/api/audio/formant-references?speaker_type=${speakerType}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Loaded initial references:', data);
      
      // Create initial plot data with reference vowels
      const vowelEntries = Object.entries(data.vowel_references as Record<string, [number, number]>);
      const initialPlotData: PlotData = {
        plot_config: data.plot_config,
        reference_vowels: vowelEntries.map(([vowel, [f1, f2]]) => ({
          vowel,
          f1,
          f2
        })),
        user_points: [],
        current_vowel: undefined
      };
      
      setPlotData(initialPlotData);
      console.log('Set plot data with', vowelEntries.length, 'reference vowels');
    } catch (error) {
      console.error('Failed to load initial references:', error);
      console.log('Using fallback plot data');
      // Fall back to default data if API fails
      setPlotData(createFallbackPlotData());
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      console.log('Starting recording...');
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 22050,
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      });
      
      console.log('Got media stream');
      streamRef.current = stream;
      
      // Set up audio context for real-time processing
      audioContextRef.current = new AudioContext({ sampleRate: 22050 });
      console.log('Created audio context');
      
      // Load the AudioWorklet processor
      await audioContextRef.current.audioWorklet.addModule('/formant-processor.js');
      console.log('Loaded audio worklet');
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      // Create AudioWorkletNode
      workletNodeRef.current = new AudioWorkletNode(audioContextRef.current, 'formant-processor');
      
      // Set up message handling for audio data
      workletNodeRef.current.port.onmessage = (event) => {
        if (!isRecording || !socketRef.current) return;
        
        if (event.data.type === 'audioData') {
          const audioData = event.data.buffer;
          
          // Convert to base64 and send via socket
          const buffer = new Float32Array(audioData);
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(buffer.buffer)));
          
          socketRef.current.emit('audio_chunk', {
            audio: base64Audio,
            timestamp: Date.now()
          });
        }
      };
      
      // Connect audio nodes
      source.connect(workletNodeRef.current);
      workletNodeRef.current.connect(audioContextRef.current.destination);
      
      console.log('Connected audio nodes');
      
      // Start recording
      setIsRecording(true);
      socketRef.current?.emit('start_recording', { speaker_type: speakerType });
      console.log('Started recording with speaker type:', speakerType);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    setIsRecording(false);
    
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
      console.log('Disconnected worklet node');
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      console.log('Stopped media stream');
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      console.log('Closed audio context');
    }
    
    socketRef.current?.emit('stop_recording');
    console.log('Sent stop recording signal');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Real-Time Formant Analysis
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Speak into your microphone to see your vowel formants plotted in real-time 
            against IPA reference values. Watch as your speech patterns appear on the vowel space chart.
          </p>
        </div>

        {/* Connection status */}
        <div className="text-center mb-6">
          <Chip
            text={isConnected ? "Connected" : "Disconnected"}
            accent={isConnected ? "green" : "red"}
          />
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Speaker Type:
              </label>
              <select
                value={speakerType}
                onChange={(e) => setSpeakerType(e.target.value as 'male' | 'female' | 'child')}
                disabled={isRecording}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="child">Child</option>
              </select>
            </div>
            
            <div className="flex gap-4">
              {!isRecording ? (
                <Button
                  text="Start Recording"
                  onClick={startRecording}
                  disabled={!isConnected}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                  accent="green"
                />
              ) : (
                <Button
                  text="Stop Recording"
                  onClick={stopRecording}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
                  accent="red"
                />
              )}
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Current formant info */}
        {currentFormant && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Current Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(currentFormant.f1)} Hz
                </div>
                <div className="text-sm text-gray-600">F1</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(currentFormant.f2)} Hz
                </div>
                <div className="text-sm text-gray-600">F2</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  /{currentFormant.vowel}/
                </div>
                <div className="text-sm text-gray-600">Detected Vowel</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(currentFormant.confidence * 100)}%
                </div>
                <div className="text-sm text-gray-600">Confidence</div>
              </div>
            </div>
          </div>
        )}

        {/* Formant plot */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Vowel Space Visualization</h3>
          <div className="flex justify-center">
            <RealTimeFormantPlot 
              plotData={plotData} 
              isRecording={isRecording}
            />
          </div>
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>
              Gray dots show IPA reference vowels for {speakerType} speakers. 
              Colored lines show your real-time formant trajectory.
            </p>
            <p className="mt-2">
              Line color indicates confidence: <span className="text-green-600">green = high</span>, 
              <span className="text-yellow-600"> yellow = medium</span>, 
              <span className="text-red-600"> red = low</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
