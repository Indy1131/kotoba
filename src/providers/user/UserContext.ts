import { createContext } from "react";

export type User = {
  username: string;
  language: "Chinese" | "english";
};

type UserContextType = {
  user: User | null;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
