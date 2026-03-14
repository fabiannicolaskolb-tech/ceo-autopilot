import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", className, children, ...props }, ref) => {
  const label = children ?? text;
  return (
    <button
      ref={ref}
      className={cn(
        "group relative w-auto cursor-pointer overflow-hidden rounded-full border border-border bg-background p-2 px-6 text-center text-sm font-medium text-foreground",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <div className="absolute left-2 h-2 w-2 rounded-full bg-primary transition-all duration-300 group-hover:h-full group-hover:w-full group-hover:left-0 group-hover:top-0 group-hover:rounded-full" />
        <span className="relative ml-4 inline-flex translate-x-0 items-center transition-all duration-300 group-hover:-translate-x-12 group-hover:opacity-0">
          {label}
        </span>
      </div>
      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <span>{label}</span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
