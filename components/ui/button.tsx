import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * All actionable controls clear a 44px touch target on mobile, which is why
 * the base height is set in rem rather than left to padding alone.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[3px] font-semibold tracking-tight transition-[background-color,border-color,color,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary:
          "bg-floodlight text-ink hover:bg-floodlight-soft border border-floodlight",
        outline:
          "border border-crease bg-transparent text-chalk hover:border-floodlight hover:text-floodlight",
        subtle:
          "border border-turf bg-pitch text-chalk hover:border-crease hover:bg-ink-raised",
        ghost: "text-chalk-dim hover:text-chalk",
        danger:
          "border border-leather/60 bg-leather/15 text-leather-soft hover:bg-leather/25",
      },
      size: {
        sm: "h-9 px-3 text-[0.8125rem]",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-[0.9375rem] sm:h-13 sm:px-8 sm:text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Render as the single child element (e.g. a `next/link`) instead of a button. */
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...(asChild ? {} : { type: type ?? "button" })}
      {...props}
    />
  );
}

export { buttonVariants };
