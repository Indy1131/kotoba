import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
};

export default function Tooltip({ text }: Props) {
  const [expanded, setExpanded] = useState(false);
  const spanRef = useRef(null);
  const [side, setSide] = useState("right");

  useEffect(() => {
    function checkSide() {
      if (!spanRef.current) return;

      const rect = spanRef.current.getBoundingClientRect();
      const elementCenterX = rect.left + rect.width / 2;
      const windowWidth = window.innerWidth;

      setSide(elementCenterX < windowWidth / 2 ? "left" : "right");
    }

    checkSide();
    window.addEventListener("resize", checkSide);

    return () => {
      window.removeEventListener("resize", checkSide);
    };
  }, []);

  function handleHover() {
    setExpanded(true);
  }

  function handleLeave() {
    setExpanded(false);
  }

  return (
    <span
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
      ref={spanRef}
      className="inline-block relative text-negative underline cursor-pointer pointer-events-auto"
    >
      {text}
      {expanded && (
        <div
          className={`${
            side == "right" && "right-0"
          } flex w-[300px] gap-2 text-black font-normal border-1 border-light-outline text-sm absolute bg-light p-2 rounded-xl cursor-default transition-all bottom-full`}
        >
          <div className="flex-1">
            <h1 className="text-outline text-[10px]">Phonemes</h1>
            <div className="border-1 border-light-outline p-2 rounded-md">
              AE1 S K
            </div>
          </div>
          <div className="">
            <h1 className="text-outline text-[10px]">Audio Sample</h1>
            <div className="border-1 border-light-outline p-2 rounded-md">
              Audio sample
            </div>
          </div>
          {/* <Button text="Play" /> */}
        </div>
      )}
    </span>
  );
}
