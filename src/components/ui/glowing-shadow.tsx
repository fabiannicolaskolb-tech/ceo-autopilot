import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GlowingShadowProps {
  children: ReactNode
  className?: string
}

export function GlowingShadow({ children, className }: GlowingShadowProps) {
  return (
    <div className={cn("glow-container", className)}>
      <div className="glow" />
      <div className="glow-content">{children}</div>
    </div>
  )
}

export default GlowingShadow
