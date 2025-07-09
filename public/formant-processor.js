// AudioWorklet processor for real-time formant analysis
class FormantProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 1024;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    if (input && input.length > 0) {
      const inputChannel = input[0];
      
      for (let i = 0; i < inputChannel.length; i++) {
        this.buffer[this.bufferIndex] = inputChannel[i];
        this.bufferIndex++;
        
        // When buffer is full, send it to main thread
        if (this.bufferIndex >= this.bufferSize) {
          // Send the buffer to main thread
          this.port.postMessage({
            type: 'audioData',
            buffer: this.buffer.slice() // Create a copy
          });
          
          // Reset buffer with 50% overlap
          const overlap = this.bufferSize / 2;
          this.buffer.copyWithin(0, overlap);
          this.bufferIndex = overlap;
        }
      }
    }
    
    return true; // Keep processor alive
  }
}

registerProcessor('formant-processor', FormantProcessor);
