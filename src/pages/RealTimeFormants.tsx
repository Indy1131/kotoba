import { useState, useRef, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Button from '../components/Button';
import useUser from '../providers/user/useUser';

interface FormantPoint {
  f1: number;
  f2: number;
  timestamp: number;
}

interface VowelReference {
  vowel: string;
  f1: number;
  f2: number;
}

interface PlotConfig {
  f1_range: [number, number];
  f2_range: [number, number];
  invert_axes: boolean;
}

const RealTimeFormantPlot = ({ 
  formantPoint, 
  references, 
  plotConfig 
}: { 
  formantPoint: FormantPoint | null;
  references: VowelReference[];
  plotConfig: PlotConfig;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const drawPlot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d')!;
    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    const margin = 40;
    const plotWidth = width - 2 * margin;
    const plotHeight = height - 2 * margin;
    
    const [f1Min, f1Max] = plotConfig.f1_range;
    const [f2Min, f2Max] = plotConfig.f2_range;
    
    const f1ToY = (f1: number) => {
      const normalized = plotConfig.invert_axes
        ? (f1Max - f1) / (f1Max - f1Min)
        : (f1 - f1Min) / (f1Max - f1Min);
      return margin + normalized * plotHeight;
    };
    
    const f2ToX = (f2: number) => {
      const normalized = plotConfig.invert_axes
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
    
    // F2 label
    ctx.fillText('F2 (Hz)', width / 2, height - 10);
    
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
    
    references.forEach(({ vowel, f1, f2 }) => {
      const x = f2ToX(f2);
      const y = f1ToY(f1);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillText(vowel, x, y - 15);
    });
    
    // Draw current formant point
    if (formantPoint) {
      const x = f2ToX(formantPoint.f2);
      const y = f1ToY(formantPoint.f1);
      
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();
    }
    
  }, [formantPoint, references, plotConfig]);
  
  // Update plot on each frame
  useEffect(() => {
    drawPlot();
  }, [drawPlot]);
  
  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      className="w-full h-96 border border-gray-200 rounded-lg bg-white"
    />
  );
};

export default function RealTimeFormants() {
  const { user } = useUser();
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected'>('disconnected');
  const [currentFormant, setCurrentFormant] = useState<FormantPoint | null>(null);
  const [speakerType, setSpeakerType] = useState<'male' | 'female' | 'child'>('male');
  const [vowelReferences, setVowelReferences] = useState<VowelReference[]>([]);
  const [plotConfig, setPlotConfig] = useState<PlotConfig>({
    f1_range: [200, 800],
    f2_range: [600, 3000],
    invert_axes: true
  });
  
  const socketRef = useRef<Socket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Load reference vowels on speaker type change
  useEffect(() => {
    fetch(`http://localhost:5001/api/audio/formant-references?speaker_type=${speakerType}`)
      .then(res => res.json())
      .then(data => {
        setVowelReferences(data.vowel_references.map((ref: any) => ({
          vowel: ref.vowel,
          f1: ref.f1,
          f2: ref.f2
        })));
        setPlotConfig({
          f1_range: data.plot_config.f1_range,
          f2_range: data.plot_config.f2_range,
          invert_axes: data.plot_config.invert_axes
        });
      })
      .catch(console.error);
  }, [speakerType]);
  
  // Initialize WebSocket connection
  useEffect(() => {
    const socket = io('http://localhost:5001', {
      transports: ['websocket'],
      reconnection: true
    });
    
    socket.on('connect', () => {
      console.log('WebSocket connected');
      setConnectionStatus('connected');
    });
    
    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnectionStatus('disconnected');
    });
    
    socket.on('formant_data', (data) => {
      console.log('Received formant data:', data);
      if (data.f1 && data.f2) {
        setCurrentFormant({
          f1: data.f1,
          f2: data.f2,
          timestamp: Date.now()
        });
      }
    });
    
    socketRef.current = socket;
    return () => {
      socket.disconnect();
    };
  }, []);
  
  const startRecording = async () => {
    try {
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: false,
          echoCancellation: false,
          autoGainControl: false,
          sampleRate: 44100
        }
      });
      
      // Create audio context and nodes
      const audioContext = new AudioContext();
      await audioContext.audioWorklet.addModule('/formant-processor.js');
      
      const sourceNode = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, 'formant-processor');
      
      // Connect nodes
      sourceNode.connect(workletNode);
      workletNode.connect(audioContext.destination);
      
      // Set up message handling from audio worklet
      workletNode.port.onmessage = (event) => {
        if (event.data.type === 'audio_chunk') {
          socketRef.current?.emit('audio_chunk', {
            audio_data: event.data.chunk,
            speaker_type: speakerType
          });
        }
      };
      
      // Store refs
      streamRef.current = stream;
      audioContextRef.current = audioContext;
      sourceNodeRef.current = sourceNode;
      workletNodeRef.current = workletNode;
      
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };
  
  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    audioContextRef.current = null;
    sourceNodeRef.current = null;
    workletNodeRef.current = null;
    streamRef.current = null;
    
    setIsRecording(false);
    setCurrentFormant(null);
  };
  
  if (!user) {
    return <h1>Please log in to access real-time formant analysis</h1>;
  }
  
  return (
    <div className="flex w-full h-full flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Real-Time Formant Analysis</h1>
          <p className="text-gray-600">Visualize vowel formants as you speak</p>
        </div>
        
        <div className="flex gap-2 items-center">
          <span className={`h-3 w-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-gray-600">
            {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex gap-4 items-center justify-center bg-cardback p-4 rounded-2xl border-1 border-outline">
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-gray-700">Speaker Type:</label>
          <select
            value={speakerType}
            onChange={(e) => setSpeakerType(e.target.value as 'male' | 'female' | 'child')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            disabled={isRecording}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="child">Child</option>
          </select>
        </div>
        
        <Button
          text={isRecording ? "Recording..." : "Start Recording"}
          icon="record.svg"
          onClick={startRecording}
          disabled={isRecording || connectionStatus !== 'connected'}
          accent={isRecording ? "red" : "green"}
          className="px-6"
        />
        
        <Button
          text="Stop Recording"
          icon="stop.svg"
          onClick={stopRecording}
          disabled={!isRecording}
          accent="red"
          className="px-6"
        />
      </div>
      
      {/* Formant Plot */}
      <div className="flex-1 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Live Vowel Formant Plot</h2>
        <RealTimeFormantPlot
          formantPoint={currentFormant}
          references={vowelReferences}
          plotConfig={plotConfig}
        />
      </div>
    </div>
  );
}
