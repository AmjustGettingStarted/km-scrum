import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-inputs border border-ash bg-canvas-white px-3 py-1.5 text-sm text-charcoal placeholder:text-fog transition-colors focus-visible:outline-none focus-visible:border-midnight-ink focus-visible:ring-1 focus-visible:ring-midnight-ink disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
