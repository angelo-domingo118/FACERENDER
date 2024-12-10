import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface SectionDividerProps {
  className?: string
  variant?: "wave" | "circle" | "chevron" | "curve"
  color?: string
}

export function SectionDivider({ 
  className, 
  variant = "wave",
  color = "currentColor" 
}: SectionDividerProps) {
  const patterns = {
    wave: (
      <path 
        d="M0 20c20-8 40-8 60 0s40 8 60 0 40-8 60 0 40 8 60 0v10H0z"
        fill={color}
        fillOpacity={0.05}
      />
    ),
    circle: (
      <>
        <circle cx="30" cy="15" r="3" fill={color} fillOpacity={0.1} />
        <circle cx="90" cy="15" r="3" fill={color} fillOpacity={0.1} />
        <circle cx="150" cy="15" r="3" fill={color} fillOpacity={0.1} />
        <circle cx="210" cy="15" r="3" fill={color} fillOpacity={0.1} />
      </>
    ),
    chevron: (
      <path
        d="M0 20L30 5L60 20L90 5L120 20L150 5L180 20L210 5L240 20V30H0z"
        fill={color}
        fillOpacity={0.05}
      />
    ),
    curve: (
      <path
        d="M0,20 Q60,5 120,20 Q180,35 240,20 V30 H0 Z"
        fill={color}
        fillOpacity={0.05}
      />
    )
  }

  return (
    <div className={cn("relative w-full h-8 overflow-hidden", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0"
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 240 30"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id={`divider-pattern-${variant}`}
              width="240"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              {patterns[variant]}
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill={`url(#divider-pattern-${variant})`}
          />
        </svg>
      </motion.div>
    </div>
  )
} 