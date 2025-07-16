import os
import logging
import numpy as np
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import librosa

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app with CORS and SocketIO
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]
    }
})
socketio = SocketIO(app, cors_allowed_origins="*")

# Vowel reference formants for different speaker types
VOWEL_REFERENCES = {
    'male': {
        'i': [270, 2290],   # as in 'heed'
        'ɪ': [390, 1990],   # as in 'hid'
        'e': [530, 1840],   # as in 'head'
        'æ': [660, 1720],   # as in 'had'
        'ɑ': [730, 1090],   # as in 'father'
        'ɔ': [570, 840],    # as in 'caught'
        'u': [300, 870],    # as in 'boot'
        'ʊ': [440, 1020],   # as in 'hood'
        'ʌ': [640, 1190],   # as in 'but'
    },
    'female': {
        'i': [310, 2790],
        'ɪ': [430, 2480],
        'e': [610, 2330],
        'æ': [860, 2050],
        'ɑ': [850, 1220],
        'ɔ': [590, 920],
        'u': [370, 950],
        'ʊ': [470, 1160],
        'ʌ': [760, 1400],
    },
    'child': {
        'i': [370, 3200],
        'ɪ': [530, 2730],
        'e': [690, 2600],
        'æ': [1010, 2320],
        'ɑ': [1030, 1370],
        'ɔ': [680, 1060],
        'u': [430, 1170],
        'ʊ': [550, 1425],
        'ʌ': [850, 1590],
    }
}

PLOT_CONFIGS = {
    'male': {
        'f1_range': [200, 800],
        'f2_range': [600, 3000],
        'invert_axes': True
    },
    'female': {
        'f1_range': [200, 1000],
        'f2_range': [600, 3500],
        'invert_axes': True
    },
    'child': {
        'f1_range': [300, 1200],
        'f2_range': [600, 4000],
        'invert_axes': True
    }
}

def analyze_formants(audio_data, sr=44100, n_formants=2):
    """Extract formant frequencies from audio data using a simplified approach."""
    try:
        # Convert input to numpy array if it isn't already
        audio_data = np.array(audio_data, dtype=np.float32)
        
        # Ensure we have enough samples and convert to mono if needed
        if len(audio_data) < 512:
            return None
        if len(audio_data.shape) > 1:
            audio_data = np.mean(audio_data, axis=1)
        
        # Apply pre-emphasis filter
        pre_emphasis = np.append(audio_data[0], audio_data[1:] - 0.97 * audio_data[:-1])
        
        # Normalize audio
        max_val = np.abs(pre_emphasis).max()
        if max_val > 0:
            pre_emphasis = pre_emphasis / max_val
            
        # Calculate spectrum using FFT
        n_fft = 2048
        spectrum = np.abs(np.fft.rfft(pre_emphasis * np.hamming(len(pre_emphasis)), n=n_fft))
        freqs = np.fft.rfftfreq(n_fft, d=1/sr)
        
        # Find peaks in the spectrum
        from scipy.signal import find_peaks
        peaks, _ = find_peaks(spectrum, distance=20)
        peak_freqs = freqs[peaks]
        peak_mags = spectrum[peaks]
        
        # Sort peaks by magnitude and get the frequencies
        sorted_indices = np.argsort(peak_mags)[::-1]
        peak_freqs = peak_freqs[sorted_indices]
        
        # Filter frequencies to reasonable formant ranges
        formant_freqs = peak_freqs[(peak_freqs > 90) & (peak_freqs < 4000)]
        
        if len(formant_freqs) >= n_formants:
            # Convert to Python floats to ensure serializability
            return [float(f) for f in formant_freqs[:n_formants]]
        return None
        
    except Exception as e:
        logger.error(f"Error analyzing formants: {e}")
        return None
    
    except Exception as e:
        logger.error(f"Error analyzing formants: {e}")
        return None

@app.route('/health')
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "kotoba-audio-processing"
    })

@app.route('/api/audio/formant-references')
def get_formant_references():
    """Get vowel formant references for plotting."""
    speaker_type = request.args.get('speaker_type', 'male')
    if speaker_type not in VOWEL_REFERENCES:
        return jsonify({"error": "Invalid speaker type"}), 400
    
    # Convert reference format
    references = []
    for vowel, (f1, f2) in VOWEL_REFERENCES[speaker_type].items():
        references.append({
            "vowel": vowel,
            "f1": f1,
            "f2": f2
        })
    
    return jsonify({
        "vowel_references": references,
        "plot_config": PLOT_CONFIGS[speaker_type],
        "speaker_type": speaker_type
    })

@socketio.on('connect')
def handle_connect():
    """Handle WebSocket connection."""
    logger.info("Client connected")
    emit('connection_status', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnection."""
    logger.info("Client disconnected")

@socketio.on('audio_chunk')
def handle_audio_chunk(data):
    """Process incoming audio chunks and emit formant data."""
    try:
        print("Received audio chunk")
        
        # Ensure we have the required data
        if not isinstance(data, dict) or 'audio_data' not in data:
            logger.warning("Received invalid audio chunk data")
            print("❌ Invalid data format - not a dict or no audio_data")
            return

        # Convert incoming data to a simple numpy array
        try:
            audio_data = np.array([float(x) for x in data['audio_data']], dtype=np.float32)
            print(f"✓ Audio data converted to array, length: {len(audio_data)}")
            print(f"   Audio range: min={audio_data.min():.3f}, max={audio_data.max():.3f}")
        except (ValueError, TypeError):
            logger.warning("Invalid audio data format")
            print("❌ Could not convert audio data to float array")
            return

        # Skip if the audio is too quiet
        audio_max = np.abs(audio_data).max()
        print(f"📊 Audio level: {audio_max:.3f}")
        if audio_max < 0.01:
            print("🔇 Audio too quiet, skipping")
            return
            
        print("🔍 Analyzing formants...")
        formants = analyze_formants(audio_data)
        
        if formants is None:
            print("❌ No formants detected")
            return
            
        if len(formants) < 2:
            print(f"⚠️ Not enough formants detected: {len(formants)}")
            return
            
        f1, f2 = formants[0], formants[1]
        print(f"🎯 Raw formants detected: F1={f1:.1f}, F2={f2:.1f}")
        
        # Additional validation of formant values
        if not (isinstance(f1, (int, float)) and isinstance(f2, (int, float))):
            print("❌ Invalid formant types:", type(f1), type(f2))
            return
            
        if not (200 <= f1 <= 1200 and 600 <= f2 <= 4000):
            print(f"⚠️ Formants out of range: F1={f1:.1f}, F2={f2:.1f}")
            return
            
        # Ensure we're sending simple Python types
        response = {
            'f1': float(f1),
            'f2': float(f2)
        }
        emit('formant_data', response)
        print(f"✨ Successfully emitted formants: F1={f1:.1f}, F2={f2:.1f}")
        
    except Exception as e:
        logger.error(f"Error in handle_audio_chunk: {str(e)}")
        # Only emit actual errors, not serialization issues
        if not any(x in str(e).lower() for x in ['pickle', 'serializ', 'json']):
            emit('error', {'message': 'Audio processing error'})

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5001)
