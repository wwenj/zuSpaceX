import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-medium transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 uppercase tracking-wider font-pixel",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-pixel hover:shadow-pixel-lg hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-primary-hover",
        destructive:
          "bg-destructive text-destructive-foreground shadow-pixel hover:shadow-pixel-lg border-2 border-[#FF5577]",
        outline:
          "border-2 border-primary text-primary bg-transparent shadow-pixel hover:bg-primary hover:text-primary-foreground hover:shadow-pixel-lg",
        secondary:
          "bg-secondary text-secondary-foreground shadow-pixel hover:shadow-pixel-lg hover:translate-x-[-2px] hover:translate-y-[-2px] border-2 border-[#33FFAA]",
        ghost:
          "hover:bg-surface-primary hover:text-primary border-2 border-transparent hover:border-primary",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-hover border-0",
        neon: "border-2 border-primary text-primary bg-surface-primary/80 glow-primary hover:bg-primary hover:text-primary-foreground shadow-pixel",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-[10px]",
        lg: "h-12 px-6 text-xs",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
