import { cn } from "@/lib/utils";

type SpotlightProps = {
  className?: string;
};

export function Spotlight({ className }: SpotlightProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      <div
        className="
          absolute -top-48 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full
          bg-spotlight-1 opacity-30 blur-[140px]
        "
      />
      <div
        className="
          absolute -left-32 top-32 h-80 w-80 rounded-full
          bg-spotlight-2 opacity-20 blur-[160px]
        "
      />
      <div
        className="
          absolute -right-40 top-64 h-96 w-96 rounded-full
          bg-spotlight-3 opacity-20 blur-[180px]
        "
      />
    </div>
  );
}
