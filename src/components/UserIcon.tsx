import type { User } from "../providers/user/UserContext";

type Props = {
  user: User | null;
};

export default function UserIcon({ user }: Props) {
  if (!user) {
    return <h1>Loading</h1>;
  }

  return (
    <div className="flex gap-2 items-center">
      <div className="bg-gradient-to-t from-midlight to-highlight border-1 border-primary text-primary w-[2rem] h-[2rem] flex justify-center items-center font-bold rounded-full">
        {user.username.charAt(0).toUpperCase()}
      </div>
      <h1 className="font-normal text-xs">{user.username}</h1>
    </div>
  );
}
