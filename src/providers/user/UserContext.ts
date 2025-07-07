import { createContext } from "react";

export type User = {
  username: string;
  language: "Chinese" | "English";
};

type UserContextType = {
  user: User | null;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
