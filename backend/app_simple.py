"""
Simple Audio Processing API for Kotoba Language Learning
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
import logging
from audio_processor import AudioProcessor

# Initialize Flask app
app = Flask(__name__)

# Setup CORS for React frontend
CORS(app, origins=['http://localhost:5173', 'http://localhost:3000'])

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize audio processor
try:
    audio_processor = AudioProcessor()
    logger.info("Audio processor initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize audio processor: {e}")
    audio_processor = None

# Create upload directory
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "kotoba-audio-processing",
        "whisper_available": audio_processor is not None and audio_processor.whisper_model is not None
    })

@app.route('/api/audio/formants', methods=['POST'])
def analyze_formants():
    """Analyze formants and vowel classification from audio"""
    if audio_processor is None:
        return jsonify({"error": "Audio processor not available"}), 503
    
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        speaker_type = request.form.get('speaker_type', 'male')  # male, female, child
        
        # Update vowel references based on speaker type
        audio_processor.vowel_references = audio_processor._get_vowel_references(speaker_type)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            audio_file.save(temp_file.name)
            
            # Analyze formants
            formant_analysis = audio_processor.analyze_formants_from_audio(temp_file.name)
            
            # Prepare plot data
            plot_data = audio_processor.get_formant_plot_data(formant_analysis)
            
            # Clean up temp file
            os.unlink(temp_file.name)
            
            return jsonify({
                'formant_analysis': formant_analysis,
                'plot_data': plot_data,
                'speaker_type': speaker_type
            })
    
    except Exception as e:
        logger.error(f"Error analyzing formants: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/audio/formant-references', methods=['GET'])
def get_formant_references():
    """Get vowel formant references for different speaker types"""
    try:
        speaker_type = request.args.get('speaker_type', 'male')
        
        if audio_processor is None:
            # Fallback references if processor not available
            references = {
                'male': {
                    'i': (270, 2290), 'ɪ': (390, 1990), 'e': (530, 1840),
                    'æ': (660, 1720), 'ɑ': (730, 1090), 'ʌ': (640, 1190),
                    'ɔ': (570, 840), 'ʊ': (440, 1020), 'u': (300, 870)
                }
            }
            vowel_refs = references.get(speaker_type, references['male'])
        else:
            vowel_refs = audio_processor._get_vowel_references(speaker_type)
        
        return jsonify({
            'speaker_type': speaker_type,
            'vowel_references': vowel_refs,
            'plot_config': {
                'f1_range': [200, 800],
                'f2_range': [600, 3000],
                'invert_axes': True
            }
        })
    
    except Exception as e:
        logger.error(f"Error getting formant references: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/audio/analyze', methods=['POST'])
def analyze_audio():
    """Analyze audio file for pronunciation feedback"""
    if audio_processor is None:
        return jsonify({"error": "Audio processor not available"}), 503
    
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            audio_file.save(temp_file.name)
            
            # Process the audio
            result = audio_processor.analyze_pronunciation(temp_file.name)
            
            # Clean up temp file
            os.unlink(temp_file.name)
            
            return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error analyzing audio: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/audio/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio to text using Whisper"""
    if audio_processor is None:
        return jsonify({"error": "Audio processor not available"}), 503
    
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        language = request.form.get('language', 'auto')
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            audio_file.save(temp_file.name)
            
            # Transcribe the audio
            result = audio_processor.transcribe_audio(temp_file.name, language)
            
            # Clean up temp file
            os.unlink(temp_file.name)
            
            return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error transcribing audio: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
