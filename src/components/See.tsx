import Chip from "./Chip";
import IpaChart from "./IpaChart";

interface SeeProps {
  startAnimation?: boolean;
}

export default function See({ startAnimation = false }: SeeProps) {
  return (
    <div className="h-full flex-1 bg-light border-light-outline rounded-lg p-6 border font-['Helvetica']">
      <h3 className="px-2 py-1 rounded-xl border-1 border-light-outline text-2xl font-bold text-black mb-4">
        See it.
      </h3>
      <div className="border-1 border-primary backdrop-blur-sm rounded-lg p-4 bg-gradient-to-t from-midlight to-highlight">
        <IpaChart startAnimation={startAnimation} />
      </div>
    </div>
  );
}
