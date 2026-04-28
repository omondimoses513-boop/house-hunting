import { cn } from "@/lib/utils"

type TyrentLogoMarkProps = {
  className?: string
}

// Simple branded SVG mark for the Tyrent logo.
// Uses `currentColor` so the parent can control stroke/fill via Tailwind classes.
export function TyrentLogoMark({ className }: TyrentLogoMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-6 w-6", className)}
      aria-hidden="true"
    >
      {/* Roof line */}
      <path
        d="M8 10L12 6L16 10"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Top bar of the "T" */}
      <path
        d="M6.8 11H17.2"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      {/* Stem of the "T" */}
      <path
        d="M12 11V20"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  )
}

