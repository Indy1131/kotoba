# Real-Time Formant Analysis - Kotoba

This document describes the real-time formant analysis feature that displays vowel formants live as you speak.

## Features

### Real-Time Processing
- **Live Audio Capture**: Captures audio from your microphone in real-time using Web Audio API
- **Streaming Analysis**: Processes audio chunks continuously using WebSocket connection
- **Instant Visualization**: Updates the formant plot in real-time as you speak
- **Confidence Scoring**: Shows confidence levels for each formant measurement

### Interactive Visualization
- **Vowel Space Chart**: Interactive F1/F2 plot showing the vowel space
- **IPA Reference Points**: Displays reference vowel positions for different speaker types
- **Trajectory Tracking**: Shows your formant trajectory over time with fading trails
- **Confidence Color Coding**: Green (high confidence) to red (low confidence)

### Speaker Adaptation
- **Multiple Speaker Types**: Male, Female, and Child voice profiles
- **Adaptive References**: IPA vowel references adjust automatically
- **Personalized Analysis**: Formant ranges optimized for different vocal tract sizes

## How to Use

### Starting the Application

#### Option 1: Automatic Startup Script
```bash
./start_realtime_formants.sh
```

#### Option 2: Manual Startup

1. **Start Backend Server**:
   ```bash
   cd backend
   python main.py
   ```

2. **Start Frontend Server** (in a new terminal):
   ```bash
   npm run dev
   ```

3. **Open Browser**:
   Navigate to `http://localhost:5174/realtime-formants`

### Using Real-Time Analysis

1. **Set Speaker Type**: Choose Male, Female, or Child from the dropdown
2. **Start Recording**: Click "Start Recording" to begin analysis
3. **Speak Vowel Sounds**: Say clear vowel sounds like /a/, /e/, /i/, /o/, /u/
4. **Watch the Visualization**: See your formants plotted in real-time
5. **Stop Recording**: Click "Stop Recording" when finished

### Understanding the Visualization

#### Vowel Space Chart
- **X-Axis (F2)**: Second formant frequency (600-3000 Hz)
- **Y-Axis (F1)**: First formant frequency (200-800 Hz)
- **Gray Dots**: IPA reference vowel positions
- **Colored Lines**: Your real-time formant trajectory
- **Current Point**: Large colored dot showing current formants

#### Color Coding
- **Green**: High confidence (stable, clear formants)
- **Yellow**: Medium confidence (some variation)
- **Red**: Low confidence (unstable or unclear)

#### Real-Time Metrics
- **F1/F2 Values**: Current formant frequencies in Hz
- **Detected Vowel**: Closest IPA vowel classification
- **Confidence**: Percentage indicating measurement reliability

## Technical Details

### Architecture

#### Backend (Python/Flask)
- **Flask-SocketIO**: WebSocket server for real-time communication
- **Audio Processing**: LibROSA-based formant extraction
- **LPC Analysis**: Linear Predictive Coding for formant detection
- **Vowel Classification**: Distance-based IPA vowel matching

#### Frontend (React/TypeScript)
- **Socket.IO Client**: Real-time communication with backend
- **Web Audio API**: Low-latency audio capture
- **Canvas Rendering**: High-performance visualization
- **Real-time Updates**: Smooth animation and data streaming

#### Audio Processing Pipeline
1. **Capture**: Web Audio API captures 1024-sample chunks at 22kHz
2. **Transmission**: Audio chunks sent via WebSocket to backend
3. **Analysis**: LPC-based formant extraction from audio buffers
4. **Classification**: Vowel identification using IPA reference distances
5. **Visualization**: Real-time plot updates with confidence metrics

### Performance Optimizations

#### Backend
- **Rolling Buffers**: Efficient memory management for streaming audio
- **Optimized LPC**: Lower-order analysis for real-time performance
- **Confidence Filtering**: Stability-based quality assessment
- **Chunk Processing**: Overlapping analysis windows for smooth results

#### Frontend
- **Canvas Animation**: RequestAnimationFrame for smooth rendering
- **Memory Management**: Limited trajectory history to prevent memory leaks
- **Efficient Updates**: Only redraw when new data arrives
- **Fade Effects**: Smooth visual transitions for professional appearance

## Troubleshooting

### Common Issues

#### "Microphone not working"
- Check browser permissions for microphone access
- Ensure microphone is not being used by another application
- Try refreshing the page and allowing microphone permissions again
- Check browser console for "Starting recording..." debug messages

#### "Connection failed" or "Disconnected" status
- Verify backend server is running on port 5001
- Check that no firewall is blocking WebSocket connections
- Ensure both frontend and backend are running
- Look for CORS errors in browser console
- Try running `./test_realtime_formants.sh` to verify system health

#### "ScriptProcessorNode deprecated" warning
- This warning has been resolved by upgrading to AudioWorkletNode
- Clear browser cache if you still see this warning
- The system now uses modern Web Audio API standards

#### "No formants detected"
- Speak more clearly and loudly
- Try different vowel sounds (/a/, /e/, /i/, /o/, /u/)
- Ensure microphone is positioned close to your mouth
- Check that speaker type matches your voice
- Look for "🎵 Received audio chunk" messages in backend console

#### "Poor visualization quality"
- Reduce background noise
- Speak single, sustained vowel sounds
- Ensure stable internet connection for WebSocket
- Try adjusting microphone sensitivity
- Check for "📈 Formants detected" messages in backend console

### Audio Quality Tips

1. **Clear Pronunciation**: Speak distinct vowel sounds
2. **Steady Volume**: Maintain consistent speaking volume
3. **Minimal Noise**: Use in a quiet environment
4. **Close Microphone**: Position microphone 6-12 inches from mouth
5. **Single Vowels**: Focus on pure vowel sounds, not words

## Debugging

### System Health Check
Run the included test script to verify all components:
```bash
./test_realtime_formants.sh
```

### Debug Console Messages

#### Frontend Console (Browser)
When working correctly, you should see:
```
Initializing socket connection...
Connecting to: http://localhost:5001
Socket connected
Starting recording...
Got media stream
Created audio context
Loaded audio worklet
Connected audio nodes
Started recording with speaker type: male
Formant update received: {formant_data: {...}, plot_data: {...}}
```

#### Backend Console (Terminal)
When working correctly, you should see:
```
🔌 Client connected!
🎤 Starting recording for male speaker
📊 Audio processor configured for male
🎵 Received audio chunk: 1024 samples
📈 Formants detected: F1=450 F2=1200 Vowel=/a/
```

### Performance Monitoring
- **Audio chunks**: Should receive ~22 chunks per second
- **Formant detection**: Not every chunk will detect formants (normal)
- **Confidence scores**: Aim for >50% for reliable results
- **WebSocket latency**: Should be <50ms for smooth real-time experience

### Browser Compatibility
- **Chrome/Edge**: Full support with AudioWorkletNode
- **Firefox**: Full support with AudioWorkletNode  
- **Safari**: May require user gesture to start audio context
- **Mobile browsers**: Limited microphone quality may affect results

## Development

### Adding New Features

#### New Vowel References
Edit `audio_processor.py` in the `_get_vowel_references()` method to add new speaker types or vowel systems.

#### Custom Visualizations
Modify the `RealTimeFormantPlot` component in `RealTimeFormants.tsx` to add new visual elements.

#### Analysis Parameters
Adjust formant extraction parameters in the `AudioProcessor` class for different accuracy/speed tradeoffs.

### Dependencies

#### Backend
- Flask-SocketIO for WebSocket communication
- LibROSA for audio processing
- NumPy/SciPy for numerical analysis
- Whisper for speech recognition (optional)

#### Frontend
- Socket.IO client for real-time communication
- React for UI framework
- TypeScript for type safety
- Tailwind CSS for styling

## Future Enhancements

### Planned Features
- [ ] Recording and playback of formant sessions
- [ ] Pronunciation training with target vowels
- [ ] Multi-language vowel system support
- [ ] Advanced confidence metrics and feedback
- [ ] Export formant data for analysis
- [ ] Real-time pitch and intensity visualization
- [ ] Social features for comparing pronunciations

### Performance Improvements
- [ ] WebGL-based visualization for better performance
- [ ] Audio worklet for lower-latency processing
- [ ] Adaptive quality based on device capabilities
- [ ] Background processing for smoother experience

## Support

For issues, questions, or feature requests, please refer to the main project documentation or create an issue in the project repository.

---

*Part of the Kotoba Language Learning Platform*
