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
        "group relative w-auto cursor-pointer overflow-hidden rounded-full border border-border bg-background p-2 px-6 text-center text-sm font-medium text-foreground disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-primary transition-all duration-300 group-hover:scale-[100]" />
        <span className="inline-flex items-center transition-all duration-300 group-hover:opacity-0">
          {label}
        </span>
      </div>
      <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:opacity-100">
        <span>{label}</span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
