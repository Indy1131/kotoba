import { Link } from "react-router-dom";
import UserIcon from "./UserIcon";
import useUser from "../providers/user/useUser";
import Chip from "./Chip";
import Button from "./Button";
import { motion } from "framer-motion";
import iconImage from "../assets/icon.png";
export default function Navbar() {
  const { user } = useUser();

  return (
    <nav className="flex justify-center gap-2 my-4 font-medium">
      <div
        className="bg-cardback flex gap-6 items-center text-black w-[min(calc(100%-64px),1000px)] py-4 rounded-full px-8 border-1 border-outline"
        // style={{ boxShadow: "0px 3px 10px -3px var(--light-shadow)" }}
      >
        <Link to={"/about"} className="flex items-center gap-3 text-lg font-semibold">
          <img src={iconImage} alt="Kotoba Icon" className="w-8 h-8 rounded-lg" />
          Kotoba
        </Link>
        <Link to={"/record"} className="text-sm">
          Record
        </Link>
        <Link to={"/record"} className="text-sm">
          Library
        </Link>
        <Link to={"/record"} className="text-sm">
          Help
        </Link>

        <div className="ml-auto">
          <UserIcon user={user} />
        </div>
        {user && <Chip text={user.language} icon="uk.svg" />}
      </div>
    </nav>
  );
}
