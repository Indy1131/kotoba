import Button from "../components/Button";
import MicButton from "../components/MicButton";
import useUser from "../providers/user/useUser";

export default function Reader() {
  const { user } = useUser();

  if (!user) {
    return <h1>No user</h1>;
  }

  return (
    <div className="flex w-full h-full flex-col gap-2 items-center">
      <div className="flex w-[min(calc(100%-64px),1000px)] gap-2 bg-light border-1 border-light-outline p-2 rounded-2xl">
        <Button text="Button" className="w-[4rem]" />
        <Button text="Reset" className="w-[6rem]" accent="red" />
        <div className="flex-1 bg-light py-2 px-4 text-xs rounded-xl border-1 border-light-outline">
          <h1>This contains information about what to do.</h1>
        </div>
        <div className="flex-1 bg-light py-2 px-4 text-xs rounded-xl border-1 border-light-outline">
          <h1>Selected accent or something</h1>
        </div>
      </div>
      <div className="w-full flex-1 flex justify-center items-center">
        <MicButton />
      </div>
    </div>
  );
}
