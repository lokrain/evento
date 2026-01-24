import type { ReactNode } from "react";

import { H3, Small } from "@/components/ui/typography";
import type { SectionId } from "../types";

export function FormSection({
  id,
  title,
  description,
  isOpen,
  isComplete,
  isRequired,
  onToggle,
  children,
}: {
  id: SectionId;
  title: string;
  description: string;
  isOpen: boolean;
  isComplete: boolean;
  isRequired?: boolean;
  onToggle: (id: SectionId) => void;
  children: ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border ${
        isComplete ? "border-emerald-400/30 bg-emerald-500/5" : "border-border bg-card"
      }`}
    >
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
      >
        <div>
          <H3>{title}</H3>
          <Small className="text-muted-foreground">{description}</Small>
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {isComplete ? "Complete" : isRequired ? "Required" : "Optional"}
        </div>
      </button>
      {isOpen ? (
        <div id={`${id}-panel`} className="border-t border-border px-6 py-5">
          {children}
        </div>
      ) : null}
    </section>
  );
}
