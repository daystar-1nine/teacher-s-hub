import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:shadow-glow hover:-translate-y-0.5",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg hover:-translate-y-0.5",
      outline: "border-2 border-primary/30 bg-transparent text-foreground hover:bg-primary/10 hover:border-primary hover:shadow-glow",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md hover:-translate-y-0.5",
      ghost: "hover:bg-primary/10 hover:text-primary",
      link: "text-primary underline-offset-4 hover:underline",
      // Gen Z Gradient variants
      gradient: "gradient-primary text-primary-foreground shadow-lg hover:shadow-glow hover:scale-[1.02] hover:-translate-y-0.5",
      "gradient-accent": "gradient-accent text-accent-foreground shadow-lg hover:shadow-glow-accent hover:scale-[1.02] hover:-translate-y-0.5",
      "gradient-cyber": "gradient-cyber text-white shadow-lg hover:shadow-glow-cyan hover:scale-[1.02] hover:-translate-y-0.5",
      "gradient-aurora": "gradient-aurora text-white shadow-lg hover:shadow-glow hover:scale-[1.02] hover:-translate-y-0.5",
      success: "bg-success text-success-foreground hover:shadow-lg hover:-translate-y-0.5",
      warning: "bg-warning text-warning-foreground hover:shadow-lg hover:-translate-y-0.5",
      // Neon outline variants
      "neon-outline": "border-2 border-primary bg-transparent text-primary hover:bg-primary/10 shadow-[0_0_10px_hsl(var(--primary)/0.3)] hover:shadow-glow",
      "neon-outline-accent": "border-2 border-accent bg-transparent text-accent hover:bg-accent/10 shadow-[0_0_10px_hsl(var(--accent)/0.3)] hover:shadow-glow-accent",
      // Glass variants
      glass: "glass text-foreground hover:bg-card/90 backdrop-blur-xl hover:-translate-y-0.5"
    },
    size: {
      default: "h-11 px-5 py-2",
      sm: "h-9 rounded-lg px-4 text-xs",
      lg: "h-12 rounded-xl px-8 text-base",
      xl: "h-14 rounded-2xl px-10 text-lg font-bold",
      icon: "h-11 w-11 rounded-xl",
      "icon-sm": "h-9 w-9 rounded-lg",
      "icon-lg": "h-14 w-14 rounded-xl"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant,
  size,
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({
    variant,
    size,
    className
  }))} ref={ref} {...props} />;
});
Button.displayName = "Button";
export { Button, buttonVariants };