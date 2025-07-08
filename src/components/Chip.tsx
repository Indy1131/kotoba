import Svg from "./Svg";

type Props = {
  text: string;
  icon?: string | null;
  className?: string;
};

export default function Chip({ text, icon = null, className }: Props) {
  return (
    <div
      className={`${className} flex  items-center gap-1 bg-gradient-to-l from-midlight to-highlight border-primary border-1 rounded-full text-sm text-primary px-2 cursor-pointer`}
    >
      <div>{text}</div>
      {icon && <Svg src={icon} />}
    </div>
  );
}
