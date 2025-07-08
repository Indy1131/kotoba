import { useEffect, useRef, useState } from "react";
import Svg from "./Svg";

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

  const buttons = (
    <>
      <div className="w-[44px]">
        <h1 className="text-primary text-[10px]">Sample</h1>
        <div className="cursor-pointer flex justify-center items-center border-1 border-primary bg-gradient-to-t from-midlight to-highlight py-2 rounded-md">
          <Svg src="audio.svg" />
        </div>
      </div>
      <div className="w-[44px]">
        <h1 className="text-negative text-[10px]">You</h1>
        <div className="cursor-pointer flex justify-center items-center border-1 border-negative bg-gradient-to-t from-negative-midlight to-negative-highlight py-2 rounded-md">
          <Svg src="audioRed.svg" />
        </div>
      </div>
    </>
  );

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
          } flex w-[200px] gap-2 text-black font-normal border-1 border-light-outline text-sm absolute bg-light p-2 rounded-xl cursor-default transition-all bottom-full`}
        >
          {side != "right" && buttons}
          <div className="flex-1">
            <h1 className="text-outline text-[10px]">Phonemes</h1>
            <div className="border-1 border-light-outline p-2 rounded-md">
              AE1 S K
            </div>
          </div>
          {side == "right" && buttons}
        </div>
      )}
    </span>
  );
}
