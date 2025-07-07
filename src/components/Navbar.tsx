import { Link } from "react-router-dom";
import UserIcon from "./UserIcon";
import useUser from "../providers/user/useUser";
import Chip from "./Chip";

export default function Navbar() {
  const { user } = useUser();

  return (
    <nav className="flex justify-center gap-2 my-2 font-medium">
      <div
        className="bg-cardback flex gap-4 items-center text-black w-[min(calc(100%-64px),1000px)] py-2 rounded-full px-6 border-1 border-outline"
        // style={{ boxShadow: "0px 3px 10px -3px var(--light-shadow)" }}
      >
        <Link to={"/"}>Kotoba</Link>
        <Link to={"/reader"} className="text-xs">
          Reader
        </Link>

        <div className="ml-auto">
          <UserIcon user={user} />
        </div>

        {user && <Chip text={user.language} />}
      </div>
    </nav>
  );
}
