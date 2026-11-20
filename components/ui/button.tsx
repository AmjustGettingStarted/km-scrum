import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "sapphire";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer",
          // Variants
          variant === "primary" &&
            "bg-midnight-ink text-white hover:bg-charcoal rounded-buttons shadow-subtle",
          variant === "sapphire" &&
            "bg-deep-sapphire text-white hover:bg-blue-900 rounded-buttons shadow-subtle",
          variant === "secondary" &&
            "bg-paper-mist text-charcoal hover:bg-ash border border-ash rounded-buttons",
          variant === "outline" &&
            "bg-canvas-white text-charcoal hover:bg-paper-mist border border-ash rounded-buttons shadow-subtle",
          variant === "ghost" &&
            "text-charcoal hover:bg-paper-mist rounded-buttons",
          variant === "destructive" &&
            "bg-red-600 text-white hover:bg-red-700 rounded-buttons shadow-subtle",
          // Sizes
          size === "sm" && "text-xs px-2.5 py-1.5 h-8 gap-1.5",
          size === "md" && "text-sm px-3.5 py-2 h-9 gap-2",
          size === "lg" && "text-base px-4 py-2.5 h-11 gap-2.5",
          size === "icon" && "h-9 w-9 p-0",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
