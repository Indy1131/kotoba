import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import Flashlight from "./Flashlight";
import { startRecognition } from "../utilities/recording";
import Tooltip from "./Tooltip";
import Svg from "./Svg";

const POINT_COUNT = 16;

export default function MicButton() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  const recognitionRef = useRef(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {}, []);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    const dpr = window.devicePixelRatio || 1;

    const displayWidth = canvas.width;
    const displayHeight = canvas.height;

    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    const width = displayWidth;
    const height = displayHeight;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const drawFrame = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset any existing transform
      ctx.scale(dpr, dpr);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#409af5";

      const points: [number, number][] = [];
      const segmentWidth = width / (POINT_COUNT - 1);
      const step = Math.floor(bufferLength / POINT_COUNT);

      for (let i = 0; i < POINT_COUNT; i++) {
        const volume = dataArray[i * step] / 255;
        const x = i * segmentWidth;

        const padding = 50;
        let y = height / 1 - (volume + 0.5) * height * 0.3;

        // Clamp y to fit inside the canvas (with padding)
        // y = Math.min(Math.max(y, padding), height - padding);

        points.push([x, y]);
      }

      const round = (v: number) => Math.round(v) + 0.5;

      ctx.moveTo(round(points[0][0]), round(points[0][1]));

      for (let i = 1; i < points.length - 2; i++) {
        const [x0, y0] = points[i - 1];
        const [x1, y1] = points[i];
        const [x2, y2] = points[i + 1];
        const [x3, y3] = points[i + 2];

        const cp1x = x1 + (x2 - x0) / 6;
        const cp1y = y1 + (y2 - y0) / 6;
        const cp2x = x2 - (x3 - x1) / 6;
        const cp2y = y2 - (y3 - y1) / 6;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
      }

      const last = points[points.length - 1];
      ctx.lineTo(round(last[0]), round(last[1]));

      ctx.stroke();

      animationRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  async function handleRecordClick() {
    setTranscript("");
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        noiseSuppression: true,
        echoCancellation: true,
        autoGainControl: true,
        sampleRate: 44100,
      },
    });
    micStreamRef.current = stream;
    const audioCtx = new AudioContext();
    audioContextRef.current = audioCtx;
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;
    draw();

    startRecognition(setTranscript, recognitionRef);
  }

  function handleStopClick() {
    setTranscript("set");
    setIsRecording(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    audioContextRef.current?.close();
  }

  return (
    <form onSubmit={handleSubmit} className="inline-block">
      <div className="overflow-hidden w-[600px] h-[600px] relative bg-gradient-to-t from-midlight rounded-2xl to-highlight border-primary border-1">
        <Flashlight className="rounded-2xl z-10" color="white" />
        {transcript == "" ? (
          <>
            <canvas
              ref={canvasRef}
              height={600}
              width={600}
              className="absolute z-10 w-full h-full pointer-events-none"
            />
            {!isRecording && (
              <div className="w-full h-full flex justify-center items-center p-10 pointer-events-none select-none">
                <h1 className="font-medium z-10 text-primary text-xl pointer-events-none">
                  Press{" "}
                  <span className="font-bold inline-flex items-center">
                    Record
                    <Svg src="record.svg" className="w-[24px]" />
                  </span>{" "}
                  to begin recording.
                </h1>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex justify-center items-center p-10 pointer-events-none select-none">
            <h1 className="font-medium z-10 text-primary text-xl pointer-events-none fade-in transition-all">
              <Tooltip text="Pl" />
              ease call Stella. <Tooltip text="Ask" /> her to bring these{" "}
              <Tooltip text="th" />
              ings with her from the store.
            </h1>
          </div>
        )}
      </div>
      <div className="flex gap-2 items-center justify-center my-4 bg-cardback p-2 rounded-2xl border-1 border-outline">
        <Button
          icon="play.svg"
          // accent="orange"
          // onClick={handleRecordClick}‰
          disabled={isRecording || transcript == ""}
        />
        <Button
          icon="pause.svg"
          // accent="orange"
          // onClick={handleRecordClick}‰
          // className="w-[4rem]"
          disabled={isRecording || transcript == ""}
        />
        <Button
          text="Record"
          icon="record.svg"
          className="flex-1"
          // accent="green"
          onClick={handleRecordClick}
          disabled={isRecording}
        />
        <Button
          text="Stop"
          icon="stop.svg"
          className="w-[8rem]"
          accent="red"
          onClick={handleStopClick}
          disabled={!isRecording}
        />
      </div>
    </form>
  );
}
