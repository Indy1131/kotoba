import librosa
import numpy as np
import soundfile as sf
import whisper
from scipy import signal
from scipy.spatial.distance import cosine
import json
from collections import deque
import queue
import threading
import time

class AudioProcessor:
    def __init__(self):
        """Initialize the audio processor with Whisper model"""
        try:
            # Correct way to load Whisper model
            self.whisper_model = whisper.load_model("base")
        except Exception as e:
            print(f"Warning: Could not load Whisper model: {e}")
            self.whisper_model = None
        
        # Initialize formant analysis constants
        self.N_LPC = 12
        self.N_FORMANTS = 3
        self.formant_history = deque(maxlen=50)  # Store last 50 formant measurements
        
        # Real-time processing buffers
        self.audio_buffer = deque(maxlen=8192)  # Rolling audio buffer
        self.sample_rate = 22050
        self.chunk_size = 1024
        self.overlap = 512
        
        # IPA reference formant values
        self.vowel_references = self._get_vowel_references()
    
    def _get_vowel_references(self, speaker_type='male'):
        """Get IPA vowel reference formant values"""
        if speaker_type == 'female':
            return {
                'i': (310, 2790), 'ɪ': (430, 2480), 'e': (610, 2330),
                'æ': (860, 2050), 'ɑ': (850, 1220), 'ʌ': (700, 1370),
                'ɔ': (590, 920), 'ʊ': (470, 1160), 'u': (370, 950)
            }
        elif speaker_type == 'child':
            return {
                'i': (370, 3200), 'ɪ': (480, 2900), 'e': (690, 2700),
                'æ': (1030, 2300), 'ɑ': (970, 1350), 'ʌ': (880, 1450),
                'ɔ': (680, 1000), 'ʊ': (540, 1200), 'u': (430, 1080)
            }
        else:  # default: male
            return {
                'i': (270, 2290), 'ɪ': (390, 1990), 'e': (530, 1840),
                'æ': (660, 1720), 'ɑ': (730, 1090), 'ʌ': (640, 1190),
                'ɔ': (570, 840), 'ʊ': (440, 1020), 'u': (300, 870)
            }
    
    def load_audio(self, file_path, sr=22050):
        """Load audio file with librosa"""
        try:
            audio, sample_rate = librosa.load(file_path, sr=sr)
            return audio, sample_rate
        except Exception as e:
            raise Exception(f"Error loading audio file: {e}")
    
    def extract_features(self, file_path):
        """Extract comprehensive audio features"""
        try:
            audio, sr = self.load_audio(file_path)
            
            # Basic features
            duration = len(audio) / sr
            
            # Pitch features
            pitches, magnitudes = librosa.core.piptrack(y=audio, sr=sr)
            pitch_values = []
            for t in range(pitches.shape[1]):
                index = magnitudes[:, t].argmax()
                pitch = pitches[index, t] if magnitudes[index, t] > 0 else 0
                if pitch > 0:
                    pitch_values.append(pitch)
            
            f0_mean = np.mean(pitch_values) if pitch_values else 0
            f0_std = np.std(pitch_values) if pitch_values else 0
            
            # Spectral features
            spectral_centroids = librosa.feature.spectral_centroid(y=audio, sr=sr)[0]
            spectral_rolloff = librosa.feature.spectral_rolloff(y=audio, sr=sr)[0]
            mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)
            
            # Energy features
            rms = librosa.feature.rms(y=audio)[0]
            
            # Formant estimation (simplified)
            formants = self.estimate_formants(audio, sr)
            
            return {
                "duration": duration,
                "pitch": {
                    "mean": float(f0_mean),
                    "std": float(f0_std),
                    "values": [float(p) for p in pitch_values[:100]]  # Limit for JSON size
                },
                "spectral": {
                    "centroid_mean": float(np.mean(spectral_centroids)),
                    "rolloff_mean": float(np.mean(spectral_rolloff))
                },
                "mfcc": {
                    "mean": [float(x) for x in np.mean(mfcc, axis=1)],
                    "std": [float(x) for x in np.std(mfcc, axis=1)]
                },
                "energy": {
                    "rms_mean": float(np.mean(rms)),
                    "rms_std": float(np.std(rms))
                },
                "formants": formants
            }
        
        except Exception as e:
            raise Exception(f"Error extracting features: {e}")
    
    def estimate_formants(self, audio, sr, n_formants=3):
        """Estimate formant frequencies using LPC"""
        try:
            # Pre-emphasis filter
            pre_emphasis = 0.97
            emphasized = np.append(audio[0], audio[1:] - pre_emphasis * audio[:-1])
            
            # Window the signal
            windowed = emphasized * np.hamming(len(emphasized))
            
            # LPC analysis
            order = int(2 + sr / 1000)  # Rule of thumb for LPC order
            lpc_coeffs = librosa.lpc(windowed, order=order)
            
            # Find roots and extract formants
            roots = np.roots(lpc_coeffs)
            roots = roots[np.imag(roots) >= 0]  # Keep only positive frequencies
            
            # Convert to frequencies
            angles = np.angle(roots)
            frequencies = angles * (sr / (2 * np.pi))
            
            # Sort and take first n_formants
            formants = sorted([f for f in frequencies if 90 < f < sr/2])[:n_formants]
            
            return [float(f) for f in formants]
        
        except Exception as e:
            print(f"Warning: Could not estimate formants: {e}")
            return []
    
    def transcribe_audio(self, file_path, language='auto'):
        """Transcribe audio using Whisper"""
        try:
            if self.whisper_model is None:
                return {"error": "Whisper model not available"}
            
            # Transcribe
            if language == 'auto':
                result = self.whisper_model.transcribe(file_path)
            else:
                result = self.whisper_model.transcribe(file_path, language=language)
            
            return {
                "text": result["text"],
                "language": result.get("language", "unknown"),
                "segments": [
                    {
                        "start": seg["start"],
                        "end": seg["end"],
                        "text": seg["text"]
                    }
                    for seg in result.get("segments", [])
                ]
            }
        
        except Exception as e:
            raise Exception(f"Error transcribing audio: {e}")
    
    def analyze_pronunciation(self, file_path):
        """Analyze pronunciation quality"""
        try:
            features = self.extract_features(file_path)
            
            # Simple pronunciation scoring based on features
            # This is a simplified example - real pronunciation analysis would be much more complex
            
            pitch_stability = 1 / (1 + features["pitch"]["std"] / max(features["pitch"]["mean"], 1))
            energy_consistency = 1 / (1 + features["energy"]["rms_std"] / max(features["energy"]["rms_mean"], 0.01))
            
            # Overall score (0-100)
            overall_score = (pitch_stability + energy_consistency) / 2 * 100
            
            return {
                "overall_score": min(100, max(0, float(overall_score))),
                "pitch_stability": float(pitch_stability),
                "energy_consistency": float(energy_consistency),
                "features": features,
                "feedback": self.generate_feedback(features, overall_score)
            }
        
        except Exception as e:
            raise Exception(f"Error analyzing pronunciation: {e}")
    
    def generate_feedback(self, features, score):
        """Generate pronunciation feedback"""
        feedback = []
        
        if score < 50:
            feedback.append("Try to speak more clearly and consistently.")
        elif score < 75:
            feedback.append("Good pronunciation! Focus on maintaining steady pitch.")
        else:
            feedback.append("Excellent pronunciation!")
        
        if features["pitch"]["std"] > 50:
            feedback.append("Try to maintain a more stable pitch.")
        
        if features["energy"]["rms_mean"] < 0.01:
            feedback.append("Speak a bit louder for better analysis.")
        
        return feedback
    
    def compare_audio(self, user_file, reference_file):
        """Compare user audio with reference audio"""
        try:
            user_features = self.extract_features(user_file)
            ref_features = self.extract_features(reference_file)
            
            # Compare MFCC features
            user_mfcc = np.array(user_features["mfcc"]["mean"])
            ref_mfcc = np.array(ref_features["mfcc"]["mean"])
            
            # Cosine similarity
            similarity = 1 - cosine(user_mfcc, ref_mfcc)
            similarity_score = max(0, min(100, similarity * 100))
            
            # Pitch comparison
            pitch_diff = abs(user_features["pitch"]["mean"] - ref_features["pitch"]["mean"])
            pitch_similarity = max(0, 100 - pitch_diff)
            
            return {
                "similarity_score": float(similarity_score),
                "pitch_similarity": float(pitch_similarity),
                "user_features": user_features,
                "reference_features": ref_features,
                "comparison": {
                    "pitch_difference": float(pitch_diff),
                    "mfcc_similarity": float(similarity)
                }
            }
        
        except Exception as e:
            raise Exception(f"Error comparing audio: {e}")
    
    def lpc_formants_advanced(self, audio_frame, fs):
        """Advanced LPC-based formant analysis"""
        try:
            # Apply Hamming window
            windowed = audio_frame * np.hamming(len(audio_frame))
            
            # LPC analysis with higher order for better formant resolution
            lpc_coeffs = librosa.lpc(windowed, order=self.N_LPC)
            
            # Find roots of the LPC polynomial
            roots = np.roots(lpc_coeffs)
            
            # Keep only roots with positive imaginary parts (positive frequencies)
            roots = roots[np.imag(roots) >= 0.01]
            
            # Convert to frequencies
            angles = np.arctan2(np.imag(roots), np.real(roots))
            frequencies = sorted(angles * (fs / (2 * np.pi)))
            
            # Filter reasonable formant range (90Hz - 4000Hz)
            formants = [f for f in frequencies if 90 < f < 4000]
            
            return formants[:self.N_FORMANTS]
        
        except Exception as e:
            print(f"Warning: Error in LPC formant analysis: {e}")
            return []
    
    def guess_vowel_from_formants(self, f1, f2):
        """Classify vowel based on F1 and F2 formants"""
        best_match = None
        best_distance = float('inf')
        
        for vowel, (ref_f1, ref_f2) in self.vowel_references.items():
            # Euclidean distance in formant space
            distance = np.sqrt((f1 - ref_f1) ** 2 + (f2 - ref_f2) ** 2)
            if distance < best_distance:
                best_distance = distance
                best_match = vowel
        
        return best_match, best_distance
    
    def analyze_formants_from_audio(self, file_path):
        """Analyze formants from audio file with windowing"""
        try:
            audio, sr = self.load_audio(file_path)
            
            # Parameters for windowing
            window_size = int(0.025 * sr)  # 25ms window
            hop_length = int(0.010 * sr)   # 10ms hop
            
            formant_data = []
            vowel_classifications = []
            
            # Apply noise gate threshold
            rms_threshold = 0.02
            
            # Process audio in overlapping windows
            for start in range(0, len(audio) - window_size, hop_length):
                frame = audio[start:start + window_size]
                
                # Check if frame has sufficient energy
                rms = np.sqrt(np.mean(frame**2))
                if rms < rms_threshold:
                    continue
                
                # Extract formants
                formants = self.lpc_formants_advanced(frame, sr)
                
                if len(formants) >= 2:
                    f1, f2 = formants[0], formants[1]
                    f3 = formants[2] if len(formants) >= 3 else None
                    
                    # Classify vowel
                    vowel, confidence = self.guess_vowel_from_formants(f1, f2)
                    
                    timestamp = start / sr
                    
                    formant_point = {
                        'timestamp': timestamp,
                        'f1': float(f1),
                        'f2': float(f2),
                        'f3': float(f3) if f3 else None,
                        'vowel': vowel,
                        'confidence': float(confidence),
                        'rms': float(rms)
                    }
                    
                    formant_data.append(formant_point)
                    vowel_classifications.append(vowel)
            
            # Analyze vowel distribution
            vowel_counts = {}
            for vowel in vowel_classifications:
                vowel_counts[vowel] = vowel_counts.get(vowel, 0) + 1
            
            # Most frequent vowel
            primary_vowel = max(vowel_counts.items(), key=lambda x: x[1])[0] if vowel_counts else None
            
            return {
                'formant_trajectory': formant_data,
                'vowel_distribution': vowel_counts,
                'primary_vowel': primary_vowel,
                'total_frames': len(formant_data),
                'duration': len(audio) / sr,
                'vowel_references': self.vowel_references
            }
        
        except Exception as e:
            raise Exception(f"Error analyzing formants: {e}")
    
    def get_formant_plot_data(self, formant_analysis):
        """Prepare data for formant plotting"""
        try:
            plot_data = {
                'user_points': [
                    {
                        'f1': point['f1'],
                        'f2': point['f2'],
                        'timestamp': point['timestamp'],
                        'vowel': point['vowel'],
                        'confidence': point['confidence']
                    }
                    for point in formant_analysis['formant_trajectory']
                ],
                'reference_vowels': [
                    {
                        'vowel': vowel,
                        'f1': formants[0],
                        'f2': formants[1]
                    }
                    for vowel, formants in self.vowel_references.items()
                ],
                'plot_config': {
                    'f1_range': [200, 800],
                    'f2_range': [600, 3000],
                    'invert_axes': True  # Traditional formant plot orientation
                }
            }
            
            return plot_data
        
        except Exception as e:
            raise Exception(f"Error preparing plot data: {e}")
    
    def process_audio_chunk(self, audio_chunk):
        """Process a chunk of audio data for real-time formant analysis"""
        try:
            # Convert bytes to numpy array if needed
            if isinstance(audio_chunk, bytes):
                audio_data = np.frombuffer(audio_chunk, dtype=np.float32)
            else:
                audio_data = np.array(audio_chunk, dtype=np.float32)
            
            # Add to rolling buffer
            self.audio_buffer.extend(audio_data)
            
            # Only process if we have enough data
            if len(self.audio_buffer) >= self.chunk_size * 2:
                # Get recent audio data
                recent_audio = np.array(list(self.audio_buffer)[-self.chunk_size * 2:])
                
                # Extract formants from this chunk
                formants = self._extract_formants_from_chunk(recent_audio)
                
                if formants and len(formants) >= 2:
                    f1, f2 = formants[0], formants[1]
                    
                    # Classify vowel
                    vowel_classification = self._classify_vowel(f1, f2)
                    
                    # Add to history
                    formant_data = {
                        'f1': f1,
                        'f2': f2,
                        'f3': formants[2] if len(formants) > 2 else None,
                        'vowel': vowel_classification,
                        'timestamp': time.time(),
                        'confidence': self._calculate_confidence(f1, f2)
                    }
                    
                    self.formant_history.append(formant_data)
                    return formant_data
                    
        except Exception as e:
            print(f"Error processing audio chunk: {e}")
            return None
        
        return None
    
    def _extract_formants_from_chunk(self, audio_chunk):
        """Extract formants from a small audio chunk optimized for real-time"""
        try:
            # Apply window to reduce artifacts
            windowed = audio_chunk * signal.windows.hann(len(audio_chunk))
            
            # Pre-emphasize
            emphasized = signal.lfilter([1, -0.97], [1], windowed)
            
            # LPC analysis with lower order for speed
            lpc_coeffs = librosa.lpc(emphasized, order=8)
            
            # Find roots and extract formants
            roots = np.roots(lpc_coeffs)
            roots = roots[np.imag(roots) >= 0]
            
            # Convert to frequencies
            frequencies = np.angle(roots) * self.sample_rate / (2 * np.pi)
            frequencies = frequencies[frequencies > 0]
            frequencies = np.sort(frequencies)
            
            # Filter reasonable formant range (150-4000 Hz)
            formants = frequencies[(frequencies >= 150) & (frequencies <= 4000)]
            
            return formants[:self.N_FORMANTS] if len(formants) > 0 else []
            
        except Exception as e:
            print(f"Error extracting formants from chunk: {e}")
            return []
    
    def _calculate_confidence(self, f1, f2):
        """Calculate confidence score based on formant stability and vowel space position"""
        if not self.formant_history:
            return 0.5
        
        # Check stability over recent history
        recent_f1 = [f['f1'] for f in list(self.formant_history)[-5:] if f['f1']]
        recent_f2 = [f['f2'] for f in list(self.formant_history)[-5:] if f['f2']]
        
        if len(recent_f1) < 2 or len(recent_f2) < 2:
            return 0.5
        
        # Calculate coefficient of variation (lower = more stable = higher confidence)
        f1_stability = 1.0 - (np.std(recent_f1) / np.mean(recent_f1))
        f2_stability = 1.0 - (np.std(recent_f2) / np.mean(recent_f2))
        
        # Combine stability measures
        stability_score = (f1_stability + f2_stability) / 2
        
        # Check if formants are in reasonable vowel space
        vowel_space_score = 1.0 if (150 <= f1 <= 900 and 600 <= f2 <= 3000) else 0.5
        
        return max(0.1, min(1.0, (stability_score + vowel_space_score) / 2))
    
    def get_real_time_plot_data(self):
        """Get current formant data formatted for real-time plotting"""
        if not self.formant_history:
            return None
        
        # Get reference vowels for current speaker type
        reference_vowels = [
            {'vowel': vowel, 'f1': f1, 'f2': f2}
            for vowel, (f1, f2) in self.vowel_references.items()
        ]
        
        # Get recent user points
        user_points = [
            {'f1': f['f1'], 'f2': f['f2'], 'timestamp': f['timestamp'], 'confidence': f['confidence']}
            for f in self.formant_history
            if f['f1'] and f['f2']
        ]
        
        return {
            'plot_config': {
                'f1_range': [200, 800],
                'f2_range': [600, 3000],
                'invert_axes': True
            },
            'reference_vowels': reference_vowels,
            'user_points': user_points,
            'current_vowel': self.formant_history[-1]['vowel'] if self.formant_history else None
        }
