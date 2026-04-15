import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-transform duration-150 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-[#ff906d] to-[#ff5d26] text-black hover:brightness-105 focus-visible:outline-[#ff5d26]",
        outline:
          "border border-[#8a8a8a]/20 bg-transparent text-[#ff906d] hover:bg-[#262626] focus-visible:outline-[#ff906d]",
        secondary:
          "bg-[#262626] text-white hover:bg-[#2f2f2f] focus-visible:outline-[#7d7d7d]",
      },
      size: {
        default: "px-5 py-3",
        sm: "px-4 py-2.5 text-sm",
        lg: "px-6 py-4 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
