type Props = {
  text: string;
  className?: string;
};

export default function Chip({ text, className }: Props) {
  return (
    <div
      className={`${className} bg-gradient-to-l from-midlight to-highlight border-primary border-1 rounded-full text-sm text-primary px-2 cursor-pointer`}
    >
      <div>{text}</div>
    </div>
  );
}
