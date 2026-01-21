import { cn } from "@/lib/utils";

type ImageTileProps = {
  label: string | number;
  className?: string;
};

function ImageTile({ label, className }: ImageTileProps) {
  return (
    <div className={cn("relative h-full w-full overflow-hidden rounded-xl bg-muted/40", className)}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <rect
          x="1.5"
          y="1.5"
          width="97"
          height="97"
          rx="10"
          ry="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-border"
        />
      </svg>
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-4xl font-semibold text-foreground/70">
        {label}
      </span>
    </div>
  );
}

export { ImageTile };
