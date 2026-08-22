import type { ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

export function ButtonLoading({ children }: { children: ReactNode }) {
  return (
    <>
      <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
      {children}
    </>
  );
}
