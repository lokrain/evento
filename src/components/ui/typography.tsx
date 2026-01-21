import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const typographyVariants = cva("text-foreground", {
  variants: {
    variant: {
      h1: "font-display text-4xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-5xl",
      h2: "font-display text-3xl font-semibold leading-[1.15] tracking-tight text-balance sm:text-4xl",
      h3: "font-display text-2xl font-semibold leading-[1.2] tracking-tight text-balance",
      h4: "font-display text-xl font-semibold leading-[1.25] text-balance",
      subtitle: "text-base font-medium leading-relaxed text-muted-foreground text-pretty",
      body: "text-base leading-relaxed text-foreground text-pretty",
      lead: "text-lg leading-relaxed text-muted-foreground text-pretty",
      small: "text-sm leading-relaxed text-muted-foreground text-pretty",
      overline: "text-xs uppercase tracking-[0.18em] text-muted-foreground",
    },
    tone: {
      default: "",
      muted: "text-muted-foreground",
      accent: "text-primary",
    },
  },
  defaultVariants: {
    variant: "body",
    tone: "default",
  },
});

type TypographyProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof typographyVariants> & {
    as?: React.ElementType;
  };

export function Typography({
  as: Component = "p",
  className,
  variant,
  tone,
  ...props
}: TypographyProps) {
  return <Component className={cn(typographyVariants({ variant, tone }), className)} {...props} />;
}

export const H1 = (props: Omit<TypographyProps, "as" | "variant">) => (
  <Typography as="h1" variant="h1" {...props} />
);

export const H2 = (props: Omit<TypographyProps, "as" | "variant">) => (
  <Typography as="h2" variant="h2" {...props} />
);

export const H3 = (props: Omit<TypographyProps, "as" | "variant">) => (
  <Typography as="h3" variant="h3" {...props} />
);

export const H4 = (props: Omit<TypographyProps, "as" | "variant">) => (
  <Typography as="h4" variant="h4" {...props} />
);

export const Lead = (props: Omit<TypographyProps, "as" | "variant">) => (
  <Typography as="p" variant="lead" {...props} />
);

export const Subtitle = (props: Omit<TypographyProps, "as" | "variant">) => (
  <Typography as="p" variant="subtitle" {...props} />
);

export const Body = (props: Omit<TypographyProps, "as" | "variant">) => (
  <Typography as="p" variant="body" {...props} />
);

export const Small = (props: Omit<TypographyProps, "as" | "variant">) => (
  <Typography as="p" variant="small" {...props} />
);

export const Overline = (props: Omit<TypographyProps, "as" | "variant">) => (
  <Typography as="span" variant="overline" {...props} />
);
