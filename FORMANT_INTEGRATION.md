# Formant Analysis Integration

This document describes the integration of advanced formant processing features from the external kokoromi.py file into the Kotoba language learning application.

## Features Added

### 1. **Advanced Formant Analysis Backend**
- **LPC-based formant extraction**: Uses Linear Predictive Coding for accurate formant frequency detection
- **IPA vowel classification**: Automatic classification of vowels based on F1 and F2 formants
- **Multi-speaker support**: Configurable formant references for male, female, and child speakers
- **Real-time processing**: Frame-by-frame analysis with noise gating

### 2. **React Formant Visualization Page**
- **Interactive formant plot**: Visual representation of F1 vs F2 formant frequencies
- **Real-time recording**: Record and analyze speech directly in the browser
- **Vowel classification display**: Shows detected vowels and confidence scores
- **Speaker type selection**: Switch between male, female, and child voice models

### 3. **New API Endpoints**
- `POST /api/audio/formants` - Analyze formants from audio file
- `GET /api/audio/formant-references` - Get vowel reference points for different speaker types

## How to Access the Features

### 1. **Start the Backend Server**
```bash
cd backend
python3 app_simple.py
```
The server will run on `http://localhost:5001`

### 2. **Access the Formant Analysis Page**
- Navigate to `/formants` in the React application
- Or click "Formants" in the navigation bar
- Requires user login (protected route)

### 3. **Using the Formant Analysis**
1. **Select Speaker Type**: Choose between Male, Female, or Child voice models
2. **Record Audio**: Click "Start Recording" and speak a vowel sound
3. **Stop and Analyze**: Click "Stop Recording" to process the audio
4. **View Results**: See the formant plot with your vowel trajectory and classification

## Technical Implementation

### Backend Components

#### Enhanced AudioProcessor Class
```python
class AudioProcessor:
    def lpc_formants_advanced(self, audio_frame, fs):
        """Advanced LPC-based formant analysis"""
        # Hamming windowing + LPC analysis
        # Root finding for formant frequencies
        # Frequency range filtering (90-4000 Hz)
    
    def guess_vowel_from_formants(self, f1, f2):
        """Classify vowel based on F1 and F2 formants"""
        # Euclidean distance to reference vowels
        # Returns best match and confidence score
    
    def analyze_formants_from_audio(self, file_path):
        """Full formant analysis with windowing"""
        # 25ms windows with 10ms hop
        # Noise gate threshold
        # Vowel distribution analysis
```

#### IPA Vowel References
- **Male speakers**: F1: 270-730 Hz, F2: 870-2290 Hz
- **Female speakers**: F1: 310-860 Hz, F2: 920-2790 Hz  
- **Child speakers**: F1: 370-1030 Hz, F2: 1000-3200 Hz

### Frontend Components

#### FormantAnalysis Page (`/formants`)
- **Real-time recording** with MediaRecorder API
- **Canvas-based formant plotting** with coordinate transformation
- **Interactive speaker type selection**
- **Responsive results display** with vowel distribution

#### Key Features:
- **Inverted axis display**: Traditional F1 (↓) vs F2 (←) orientation
- **Reference vowel overlay**: IPA symbols plotted at reference positions
- **Trajectory visualization**: Connected points showing formant movement
- **Color-coded confidence**: Point opacity based on classification confidence

## API Usage Examples

### Analyze Formants
```bash
curl -X POST http://localhost:5001/api/audio/formants \
  -F "audio=@recording.wav" \
  -F "speaker_type=male"
```

### Get Vowel References
```bash
curl "http://localhost:5001/api/audio/formant-references?speaker_type=female"
```

## Data Structures

### FormantPoint Interface
```typescript
interface FormantPoint {
  timestamp: number;    // Time in seconds
  f1: number;          // First formant (Hz)
  f2: number;          // Second formant (Hz)
  f3?: number;         // Third formant (Hz)
  vowel: string;       // IPA symbol
  confidence: number;  // Distance to reference
  rms: number;        // Energy level
}
```

### FormantAnalysis Response
```typescript
interface FormantAnalysis {
  formant_trajectory: FormantPoint[];
  vowel_distribution: Record<string, number>;
  primary_vowel: string;
  total_frames: number;
  duration: number;
  vowel_references: Record<string, [number, number]>;
}
```

## Navigation Integration

The formant analysis page is accessible through:
- **URL**: `/formants`
- **Navigation bar**: "Formants" link
- **Protected route**: Requires user authentication

## Dependencies Added

### Backend
- **matplotlib**: For potential offline plotting (optional)
- **collections.deque**: For formant history buffering
- **threading**: For real-time processing support

### Frontend
- **Canvas API**: For custom formant plotting
- **MediaRecorder API**: For audio recording
- **TypeScript interfaces**: For type-safe formant data

## Performance Considerations

- **Frame-based processing**: 25ms windows for real-time capability
- **Noise gating**: RMS threshold of 0.02 to filter background noise
- **Limited history**: 50-point maximum trajectory to prevent memory issues
- **Efficient rendering**: Canvas-based plotting for smooth visualization

## Future Enhancements

1. **Real-time mode**: Live formant tracking during speech
2. **Formant coaching**: Visual feedback for pronunciation correction
3. **Multi-language support**: Language-specific vowel systems
4. **Export functionality**: Save formant data and plots
5. **Comparison mode**: Compare with reference recordings

This integration brings advanced phonetic analysis capabilities to the Kotoba language learning platform, enabling detailed vowel pronunciation analysis and visual feedback for learners.
