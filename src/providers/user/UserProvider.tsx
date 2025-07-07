import { useState, type ReactNode } from "react";
import { UserContext, type User } from "./UserContext";

const SAMPLE_USER: User = {
  username: "Nicholas",
  language: "English",
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user] = useState<User | null>(SAMPLE_USER);

  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
}
