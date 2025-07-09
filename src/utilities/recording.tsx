export const startRecognition = (setTranscript, recognitionRef) => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true; // Keep listening until stopped
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const text = event.results[event.results.length - 1][0].transcript;
    console.log(text);
    // setTranscript((prev) => prev + " " + text);
  };

  recognition.start();
  recognitionRef.current = recognition;
};
