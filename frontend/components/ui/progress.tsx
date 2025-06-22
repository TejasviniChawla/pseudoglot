"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Percentage (0-100). */
  value?: number
  /** Width of the bar’s track (height in px). */
  thickness?: number
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, thickness = 8, ...props }, ref) => {
    const clamped = Math.min(100, Math.max(0, value))

    return (
      <div
        ref={ref}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
        style={{ height: thickness }}
        className={cn("w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700", className)}
        {...props}
      >
        <div
          style={{ width: `${clamped}%` }}
          className="h-full bg-blue-600 transition-[width] duration-300 ease-linear"
        />
      </div>
    )
  },
)

Progress.displayName = "Progress"
