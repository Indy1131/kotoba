import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Layout() {
  return (
    <div className="relative flex flex-col w-screen h-screen min-w-full bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      {/* <div className=" top-0 h-[12px] w-full bg-red-500" /> */}
      <Footer />
    </div>
  );
}
