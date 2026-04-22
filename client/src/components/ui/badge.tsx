import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center border px-2.5 py-0.5 text-xs font-medium transition-all focus:outline-none tracking-wide",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground shadow-pixel hover:shadow-pixel-lg",
        secondary:
          "border-secondary bg-secondary text-secondary-foreground shadow-pixel hover:shadow-pixel-lg",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground shadow-pixel",
        outline:
          "text-foreground border-primary bg-transparent hover:bg-primary hover:text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
