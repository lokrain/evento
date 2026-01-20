import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const logoVariants = cva("logo-flower", {
  variants: {
    size: {
      sm: "h-6 w-6",
      md: "h-9 w-9",
      lg: "h-12 w-12",
      xl: "h-16 w-16",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type LogoFlowerProps = React.SVGProps<SVGSVGElement> &
  VariantProps<typeof logoVariants> & {
    primaryClassName?: string;
    secondaryClassName?: string;
  };

export function LogoFlower({
  className,
  size,
  primaryClassName,
  secondaryClassName,
  ...props
}: LogoFlowerProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Evento logo"
      className={cn(logoVariants({ size }), className)}
      {...props}
    >
      <g className={cn("logo-secondary", secondaryClassName)}>
        <path d="M32 6c5.5 0 10 6.7 10 12.2 0 2.8-.9 5.6-2.7 7.7-1.8 2.2-4.4 3.6-7.3 3.6-2.9 0-5.5-1.4-7.3-3.6-1.8-2.2-2.7-4.9-2.7-7.7C22 12.7 26.5 6 32 6Z" />
        <path d="M10 24c4.8-2.8 12.1 0.9 14.9 5.8 1.4 2.5 1.9 5.4 1.2 8-0.7 2.6-2.5 4.8-5.1 6.2-2.6 1.5-5.7 1.8-8.4 0.9-2.7-.9-4.9-2.9-6.3-5.4C3.5 34.6 5.2 26.8 10 24Z" />
        <path d="M54 24c4.8 2.8 6.5 10.6 3.7 15.5-1.4 2.5-3.6 4.5-6.3 5.4-2.7.9-5.8.6-8.4-.9-2.6-1.5-4.4-3.6-5.1-6.2-0.7-2.6-0.2-5.5 1.2-8C41.9 24.9 49.2 21.2 54 24Z" />
        <path d="M18.8 46.2c2.8-4.8 10.6-6.5 15.5-3.7 2.5 1.4 4.5 3.6 5.4 6.3 0.9 2.7 0.6 5.8-.9 8.4-1.5 2.6-3.6 4.4-6.2 5.1-2.6.7-5.5.2-8-1.2-4.9-2.8-8.6-10.1-5.8-14.9Z" />
      </g>
      <circle cx="32" cy="32" r="9" className={cn("logo-primary", primaryClassName)} />
    </svg>
  );
}
