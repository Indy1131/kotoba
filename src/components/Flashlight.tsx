import { useRef } from "react";

export default function Flashlight({
  className = "",
  color,
}: {
  className?: string;
  color: string;
}) {
  const lightRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent) {
    const rect = lightRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    lightRef.current?.style.setProperty(
      "background-image",
      `radial-gradient(circle at ${x}px ${y}px, ${color} 0%, transparent 90%)`
    );
    lightRef.current?.style.setProperty("opacity", "1");
  }

  function handleMouseLeave() {
    lightRef.current?.style.setProperty("opacity", "0");
  }

  return (
    <div
      ref={lightRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseMove}
      className={`${className} overflow-hidden absolute w-full h-full transition-all`}
    />
  );
}
