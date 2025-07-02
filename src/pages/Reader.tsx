import MicButton from "../components/MicButton";
import useUser from "../providers/user/useUser";

export default function Reader() {
  const { user } = useUser();

  if (!user) {
    return <h1>No user</h1>;
  }

  return (
    <div className="flex w-full h-full flex-col gap-2 items-center">
      <h1>Hello, {user.username}!</h1>
      <h2>You've selected {user.language} as your target language.</h2>

      <div className="w-full flex-1 flex justify-center items-center">
        <MicButton />
      </div>
    </div>
  );
}
