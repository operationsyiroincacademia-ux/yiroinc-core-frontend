import type { ReactNode } from "react";

export function TableScroll({ children }: { children: ReactNode }) {
  return <div className="hidden min-w-0 overflow-x-auto md:block">{children}</div>;
}
