import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "success" | "warning" | "danger" | "purple" | "blue";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-tags text-xs font-medium transition-colors select-none",
        variant === "default" && "bg-paper-mist text-charcoal border border-ash",
        variant === "outline" && "border border-ash text-slate bg-transparent",
        variant === "success" && "bg-soft-mint text-emerald-800 border border-emerald-200",
        variant === "warning" && "bg-amber-50 text-amber-800 border border-amber-200",
        variant === "danger" && "bg-red-50 text-red-800 border border-red-200",
        variant === "purple" && "bg-purple-50 text-purple-800 border border-purple-200",
        variant === "blue" && "bg-blue-50 text-electric-blue border border-blue-200",
        className
      )}
      {...props}
    />
  );
}
