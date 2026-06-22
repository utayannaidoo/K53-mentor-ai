import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 ease-spring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "glass-edge bg-primary text-primary-foreground shadow-[0_6px_18px_-6px_hsl(var(--primary)/0.55)] hover:brightness-[1.05] hover:shadow-[0_10px_26px_-8px_hsl(var(--primary)/0.6)]",
        accent:
          "glass-edge bg-accent text-accent-foreground shadow-[0_6px_18px_-6px_hsl(var(--accent)/0.5)] hover:brightness-[1.05]",
        secondary:
          "glass-edge border border-border/60 bg-secondary/70 text-secondary-foreground backdrop-blur-sm hover:bg-secondary",
        outline:
          "glass-edge border border-border bg-card/50 text-foreground backdrop-blur-sm hover:bg-card hover:border-border/80",
        ghost: "text-foreground hover:bg-muted/70",
        link: "text-primary underline-offset-4 hover:underline",
        danger:
          "glass-edge bg-danger text-white shadow-[0_6px_18px_-6px_hsl(var(--danger)/0.5)] hover:brightness-[1.05]",
        ai: "glass-edge border border-primary/25 bg-primary/[0.07] text-primary backdrop-blur-sm hover:bg-primary/[0.12]",
      },
      size: {
        sm: "h-9 rounded-md px-3 text-sm [&_svg]:size-4",
        default: "h-10 px-4 text-sm [&_svg]:size-4",
        lg: "h-12 px-6 text-base [&_svg]:size-5",
        xl: "h-14 px-8 text-base [&_svg]:size-5",
        icon: "h-10 w-10 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
