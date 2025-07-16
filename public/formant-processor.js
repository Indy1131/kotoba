class FormantProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 1024; // Reduced buffer size
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    this.skipFrames = 0; // Add frame skipping to reduce data rate
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const channel = input[0];

    if (!channel) return true;

    // Skip some frames to reduce data rate
    this.skipFrames++;
    if (this.skipFrames < 5) return true;
    this.skipFrames = 0;

    // Downsample by taking every 4th sample
    for (let i = 0; i < channel.length; i += 4) {
      if (this.bufferIndex >= this.bufferSize) {
        // Convert to regular array and ensure values are simple numbers
        const audioData = Array.from(this.buffer).map(x => Number(x.toFixed(6)));
        this.port.postMessage({
          type: 'audio_chunk',
          chunk: audioData
        });
        this.bufferIndex = 0;
      }
      this.buffer[this.bufferIndex++] = channel[i];
    }

    return true;
  }
}

registerProcessor('formant-processor', FormantProcessor);
