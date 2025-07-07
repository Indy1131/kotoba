type Props = {
  text: string;
  disabled: boolean;
  className?: string;
  accent?: "default" | "green" | "red";
  onClick: () => void;
};

const colors = {
  default: ["from-midlight", "to-highlight", "text-primary"],
  green: ["from-positive-midlight", "to-positive-highlight", "text-positive"],
  red: ["from-negative-midlight", "to-negative-highlight", "text-negative"],
};

export default function Button({
  text,
  disabled,
  className,
  accent = "default",
  onClick,
}: Props) {
  const [from, to, textColor] = colors[accent];

  return (
    <button
      onClick={onClick}
      className={`${className} bg-gradient-to-t text-sm ${from} ${to} border-1 ${textColor} p-2 cursor-pointer disabled:brightness-80 border-b-4 disabled:border-b-1 active:border-b-1 disabled:mt-[3px] active:mt-[3px] rounded-xl transition-all`}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
