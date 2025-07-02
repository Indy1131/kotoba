import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex flex-col w-screen h-screen min-w-full">
      <nav className="h-[2rem] w-full bg-primary sticky top-0">Bar</nav>
      <div className="flex-1">
        <Outlet />
      </div>
      <footer className="bg-amber-400">
        <h1>footer</h1>
      </footer>
    </div>
  );
}
