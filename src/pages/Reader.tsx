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
<<<<<<< Updated upstream
    <div className="flex w-full h-full flex-col gap-2 items-center">
      <div className="flex w-[min(calc(100%-64px),1000px)] gap-2 bg-light border-1 border-light-outline p-2 rounded-2xl">
        <Button icon="save.svg" />
        <Button icon="trash.svg" accent="red" />
        <div className="flex-1 bg-light py-2 px-4 text-xs rounded-xl border-1 border-light-outline">
          <h1 className="flex items-center gap-2">
            Listening for <Chip text="English" icon="uk.svg" /> with a{" "}
            <Chip text="Standard American" accent="orange" icon="usa.svg" /> dialect.
          </h1>
        </div>
        <Button icon="settings.svg" />
      </div>
=======
    <div className="flex w-full h-full flex-col gap-6 items-center justify-center bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
        Hello, <span className="text-blue-600">{user.username}</span>!
      </h1>
      <h2 className="text-xl font-semibold text-gray-600 mb-4">
        You've selected <span className="text-green-600 font-bold">{user.language}</span> as your target language.
      </h2>
      <div className="border-b w-1/2 mb-6" />
>>>>>>> Stashed changes
      <div className="w-full flex-1 flex justify-center items-center">
        <MicButton />
      </div>
    </div>
  );
}
