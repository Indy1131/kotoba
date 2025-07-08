type Props = {
  src: string;
  className?: string;
};

export default function Svg({ src, className }: Props) {
  return (
    <div className={`${className} inline-block h-full w-[1rem]`}>
      <img src={src} />
    </div>
  );
}
