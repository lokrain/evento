import type { ReactNode } from "react";

export function SectionNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-muted-foreground">
      {children}
    </div>
  );
}
