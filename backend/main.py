"""
Audio Processing API for Kotoba Language Learning

This module provides endpoints for:
- Audio transcription using Whisper
- Pronunciation analysis
- Audio feature extraction
- Audio comparison for feedback
- Formant analysis and vowel classification
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import os
import tempfile
import logging
import base64
import numpy as np
from audio_processor import AudioProcessor

# Import configuration
try:
    from app_config import config
    USE_CONFIG = True
except ImportError:
    USE_CONFIG = False
    print("Warning: app_config module not found, using default configuration")

def create_app(config_name='default'):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Configuration setup
    if USE_CONFIG:
        app.config.from_object(config[config_name])
    else:
        # Fallback configuration
        app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'
        app.config['UPLOAD_FOLDER'] = 'uploads'
        app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
        app.config['CORS_ORIGINS'] = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000']
        app.config['DEBUG'] = True
    
    # Setup CORS
    CORS(app, origins=app.config.get('CORS_ORIGINS', ['http://localhost:5173', 'http://localhost:5174']))
    
    # Setup SocketIO for real-time communication
    socketio = SocketIO(app, cors_allowed_origins=app.config.get('CORS_ORIGINS', ['http://localhost:5173', 'http://localhost:5174']))
    
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
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        return jsonify({
            "status": "healthy",
            "service": "kotoba-audio-processing",
            "whisper_available": audio_processor is not None and audio_processor.whisper_model is not None
        })
    
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
    
    @app.route('/api/audio/features', methods=['POST'])
    def extract_features():
        """Extract audio features (pitch, formants, etc.)"""
        if audio_processor is None:
            return jsonify({"error": "Audio processor not available"}), 503
        
        try:
            if 'audio' not in request.files:
                return jsonify({"error": "No audio file provided"}), 400
            
            audio_file = request.files['audio']
            
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
                audio_file.save(temp_file.name)
                
                # Extract features
                features = audio_processor.extract_features(temp_file.name)
                
                # Clean up temp file
                os.unlink(temp_file.name)
                
                return jsonify(features)
        
        except Exception as e:
            logger.error(f"Error extracting features: {e}")
            return jsonify({"error": str(e)}), 500
    
    @app.route('/api/audio/compare', methods=['POST'])
    def compare_audio():
        """Compare user audio with reference audio"""
        if audio_processor is None:
            return jsonify({"error": "Audio processor not available"}), 503
        
        try:
            if 'user_audio' not in request.files or 'reference_audio' not in request.files:
                return jsonify({"error": "Both user_audio and reference_audio files required"}), 400
            
            user_file = request.files['user_audio']
            reference_file = request.files['reference_audio']
            
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as user_temp, \
                 tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as ref_temp:
                
                user_file.save(user_temp.name)
                reference_file.save(ref_temp.name)
                
                # Compare audio files
                comparison = audio_processor.compare_audio(user_temp.name, ref_temp.name)
                
                # Clean up temp files
                os.unlink(user_temp.name)
                os.unlink(ref_temp.name)
                
                return jsonify(comparison)
        
        except Exception as e:
            logger.error(f"Error comparing audio: {e}")
            return jsonify({"error": str(e)}), 500
    
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

    # WebSocket event handlers for real-time formant analysis
    @socketio.on('connect')
    def handle_connect():
        """Handle client connection"""
        logger.info("Client connected for real-time formant analysis")
        print("🔌 Client connected!")
        emit('connected', {'status': 'connected'})
    
    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle client disconnection"""
        logger.info("Client disconnected from real-time formant analysis")
        print("🔌 Client disconnected!")
    
    @socketio.on('start_recording')
    def handle_start_recording(data):
        """Handle start of real-time recording"""
        try:
            speaker_type = data.get('speaker_type', 'male')
            print(f"🎤 Starting recording for {speaker_type} speaker")
            
            if audio_processor:
                # Clear previous history and set speaker type
                audio_processor.formant_history.clear()
                audio_processor.vowel_references = audio_processor._get_vowel_references(speaker_type)
                print(f"📊 Audio processor configured for {speaker_type}")
            else:
                print("❌ Audio processor not available")
                
            emit('recording_started', {'status': 'started', 'speaker_type': speaker_type})
            logger.info(f"Started real-time recording for {speaker_type} speaker")
            
        except Exception as e:
            logger.error(f"Error starting recording: {e}")
            print(f"❌ Error starting recording: {e}")
            emit('error', {'message': str(e)})
    
    @socketio.on('audio_chunk')
    def handle_audio_chunk(data):
        """Handle incoming audio chunk for real-time processing"""
        if audio_processor is None:
            emit('error', {'message': 'Audio processor not available'})
            return
        
        try:
            # Decode audio data from base64
            audio_data = base64.b64decode(data['audio'])
            audio_array = np.frombuffer(audio_data, dtype=np.float32)
            
            print(f"🎵 Received audio chunk: {len(audio_array)} samples")
            
            # Process the audio chunk
            formant_data = audio_processor.process_audio_chunk(audio_array)
            
            if formant_data:
                print(f"📈 Formants detected: F1={formant_data['f1']:.0f} F2={formant_data['f2']:.0f} Vowel=/{formant_data['vowel']}/")
                
                # Get current plot data
                plot_data = audio_processor.get_real_time_plot_data()
                
                # Emit formant update
                emit('formant_update', {
                    'formant_data': formant_data,
                    'plot_data': plot_data
                })
            else:
                print("🔍 No formants detected in this chunk")
                
        except Exception as e:
            logger.error(f"Error processing audio chunk: {e}")
            print(f"❌ Error processing audio chunk: {e}")
            emit('error', {'message': str(e)})
    
    @socketio.on('stop_recording')
    def handle_stop_recording():
        """Handle stop of real-time recording"""
        try:
            emit('recording_stopped', {'status': 'stopped'})
            logger.info("Stopped real-time recording")
            
        except Exception as e:
            logger.error(f"Error stopping recording: {e}")
            emit('error', {'message': str(e)})

    return app, socketio

if __name__ == '__main__':
    app, socketio = create_app('development')
    socketio.run(app, debug=True, host='0.0.0.0', port=5001)
