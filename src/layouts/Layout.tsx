import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Layout() {
  return (
    <div className="relative flex flex-col w-screen h-screen bg-gradient-to-t from-highlight to-page">
      {/* <div className="w-full h-full absolute bg-purple-400/50 z-100" /> */}
      <Navbar />
      <div className="relative w-full flex-1 overflow-y-scroll">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
