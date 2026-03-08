import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[7px] text-sm font-medium font-body ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-corp hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(59,130,246,0.35)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-[1.5px] border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "border-[1.5px] border-border bg-transparent text-muted-foreground hover:border-primary hover:text-primary hover:bg-blue-pale",
        link: "text-primary underline-offset-4 hover:underline",
        navy: "bg-navy text-primary-foreground hover:bg-[hsl(213_60%_19%)] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(10,37,64,0.3)]",
        hero: "bg-primary text-primary-foreground hover:bg-corp hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(59,130,246,0.35)] text-base",
        heroSecondary: "bg-white/[0.12] text-white border-[1.5px] border-white/25 hover:bg-white/20 text-base",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-3.5 text-[0.8rem]",
        lg: "h-12 px-8 py-3 text-base",
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
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
