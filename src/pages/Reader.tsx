import Button from "../components/Button";
import Chip from "../components/Chip";
import MicButton from "../components/MicButton";
import useUser from "../providers/user/useUser";

export default function Reader() {
  const { user } = useUser();

  if (!user) {
    return <h1>No user</h1>;
  }

  return (
    <div className="flex w-full h-full flex-col items-center">
      <div className="flex w-[min(calc(100%-64px),1000px)] gap-2 bg-light border-1 border-light-outline p-2 rounded-2xl">
        <Button icon="save.svg" />
        <Button icon="trash.svg" accent="red" />
        <div className="flex-1 bg-light py-2 px-4 text-xs rounded-xl border-1 border-light-outline">
          <h1 className="flex items-center gap-2">
            Listening for <Chip text="English" icon="uk.svg" /> with a{" "}
            <Chip text="Standard American" accent="orange" icon="usa.svg" />{" "}
            dialect.
          </h1>
        </div>
        <Button icon="settings.svg" />
      </div>

      <div className="flex w-full flex-1 flex-col gap-6 items-center justify-center p-8 shadow-md">
        <div className="w-full flex-1 flex justify-center items-center">
          <MicButton />
        </div>
      </div>
    </div>
  );
}
