import Svg from "./Svg";

type Props = {
  text: string;
  icon?: string | null;
  accent?: "default" | "green" | "red" | "orange";
  className?: string;
};

export default function Chip({
  text,
  icon = null,
  accent = "default",
  className,
}: Props) {
  const colors = {
    default: ["from-midlight", "to-highlight", "text-primary"],
    green: ["from-positive-midlight", "to-positive-highlight", "text-positive"],
    red: ["from-negative-midlight", "to-negative-highlight", "text-negative"],
    orange: ["from-hint-midlight", "to-hint-highlight", "text-hint"],
  };

  const [from, to, textColor] = colors[accent];

  return (
    <div
      className={`${className} flex  items-center gap-1 bg-gradient-to-l ${from} ${to} border-1 rounded-full text-sm ${textColor} px-2 cursor-pointer`}
    >
      <div>{text}</div>
      {icon && <Svg src={icon} />}
    </div>
  );
}
