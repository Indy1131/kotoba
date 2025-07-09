/**
 * Audio Service for interacting with Python backend
 */

const API_BASE_URL = 'http://localhost:5001';

export interface AudioFeatures {
  duration: number;
  pitch: {
    mean: number;
    std: number;
    values: number[];
  };
  spectral: {
    centroid_mean: number;
    rolloff_mean: number;
  };
  mfcc: {
    mean: number[];
    std: number[];
  };
  energy: {
    rms_mean: number;
    rms_std: number;
  };
  formants: number[];
}

export interface PronunciationAnalysis {
  overall_score: number;
  pitch_stability: number;
  energy_consistency: number;
  features: AudioFeatures;
  feedback: string[];
}

export interface TranscriptionResult {
  text: string;
  language: string;
  segments: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

export interface AudioComparison {
  similarity_score: number;
  pitch_similarity: number;
  user_features: AudioFeatures;
  reference_features: AudioFeatures;
  comparison: {
    pitch_difference: number;
    mfcc_similarity: number;
  };
}

export interface FormantPoint {
  timestamp: number;
  f1: number;
  f2: number;
  f3?: number;
  vowel: string;
  confidence: number;
  rms: number;
}

export interface FormantAnalysis {
  formant_trajectory: FormantPoint[];
  vowel_distribution: Record<string, number>;
  primary_vowel: string;
  total_frames: number;
  duration: number;
  vowel_references: Record<string, [number, number]>;
}

export interface FormantPlotData {
  user_points: Array<{
    f1: number;
    f2: number;
    timestamp: number;
    vowel: string;
    confidence: number;
  }>;
  reference_vowels: Array<{
    vowel: string;
    f1: number;
    f2: number;
  }>;
  plot_config: {
    f1_range: [number, number];
    f2_range: [number, number];
    invert_axes: boolean;
  };
}

export interface FormantResponse {
  formant_analysis: FormantAnalysis;
  plot_data: FormantPlotData;
  speaker_type: string;
}

class AudioService {
  private async makeRequest(endpoint: string, formData: FormData): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  /**
   * Check if the backend service is healthy
   */
  async healthCheck(): Promise<{ status: string; service: string; whisper_available: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      throw new Error('Backend service is not available');
    }
  }

  /**
   * Analyze pronunciation of audio file
   */
  async analyzePronunciation(audioFile: File): Promise<PronunciationAnalysis> {
    const formData = new FormData();
    formData.append('audio', audioFile);

    return this.makeRequest('/api/audio/analyze', formData);
  }

  /**
   * Transcribe audio to text
   */
  async transcribeAudio(audioFile: File, language: string = 'auto'): Promise<TranscriptionResult> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('language', language);

    return this.makeRequest('/api/audio/transcribe', formData);
  }

  /**
   * Extract audio features
   */
  async extractFeatures(audioFile: File): Promise<AudioFeatures> {
    const formData = new FormData();
    formData.append('audio', audioFile);

    return this.makeRequest('/api/audio/features', formData);
  }

  /**
   * Compare user audio with reference audio
   */
  async compareAudio(userAudioFile: File, referenceAudioFile: File): Promise<AudioComparison> {
    const formData = new FormData();
    formData.append('user_audio', userAudioFile);
    formData.append('reference_audio', referenceAudioFile);

    return this.makeRequest('/api/audio/compare', formData);
  }

  /**
   * Analyze formants and vowel classification from audio
   */
  async analyzeFormants(audioFile: File, speakerType: 'male' | 'female' | 'child' = 'male'): Promise<FormantResponse> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('speaker_type', speakerType);

    return this.makeRequest('/api/audio/formants', formData);
  }

  /**
   * Get vowel formant references for different speaker types
   */
  async getFormantReferences(speakerType: 'male' | 'female' | 'child' = 'male'): Promise<{
    speaker_type: string;
    vowel_references: Record<string, [number, number]>;
    plot_config: {
      f1_range: [number, number];
      f2_range: [number, number];
      invert_axes: boolean;
    };
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/audio/formant-references?speaker_type=${speakerType}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  /**
   * Convert blob to file
   */
  blobToFile(blob: Blob, filename: string): File {
    return new File([blob], filename, { type: blob.type });
  }

  /**
   * Convert audio blob from MediaRecorder to WAV format
   */
  async convertToWav(audioBlob: Blob): Promise<File> {
    // For now, just create a file from the blob
    // In a production app, you might want to actually convert to WAV format
    return this.blobToFile(audioBlob, 'recording.wav');
  }
}

export const audioService = new AudioService();
