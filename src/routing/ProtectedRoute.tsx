import type { ReactElement } from "react";

type Props = {
  children: ReactElement;
};

export default function ProtectedRoute({ children }: Props) {
  console.log("Mounted protected route");

  return <>{children}</>;
}
