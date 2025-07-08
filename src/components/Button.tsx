import Svg from "./Svg";

type Props = {
  text?: string | null;
  icon?: string;
  disabled?: boolean;
  className?: string;
  accent?: "default" | "green" | "red" | "orange";
  onClick: () => void;
};

const colors = {
  default: ["from-midlight", "to-highlight", "text-primary"],
  green: ["from-positive-midlight", "to-positive-highlight", "text-positive"],
  red: ["from-negative-midlight", "to-negative-highlight", "text-negative"],
  orange: ["from-hint-midlight", "to-hint-highlight", "text-hint"],
};

export default function Button({
  text = null,
  icon,
  disabled = false,
  className,
  accent = "default",
  onClick,
}: Props) {
  const [from, to, textColor] = colors[accent];

  return (
    <button
      onClick={onClick}
      className={`${className} bg-gradient-to-t text-sm ${from} ${to} border-1 ${textColor} p-2 ${
        !disabled && "cursor-pointer"
      } disabled:brightness-80 border-b-4 disabled:border-b-1 active:border-b-1 disabled:mt-[3px] active:mt-[3px] rounded-xl transition-all`}
      disabled={disabled}
    >
      <p className="flex items-center justify-center">
        {text}
        {icon && <Svg className={text ? "ml-1" : "mx-1"} src={icon} />}
      </p>
    </button>
  );
}
