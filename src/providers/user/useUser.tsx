import { useContext } from "react";
import { UserContext } from "./UserContext";

export default function useUser() {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("user context is undefined");
  }

  return context;
}
