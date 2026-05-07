"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface KenyanPhoneInputProps extends Omit<React.ComponentProps<"input">, "type" | "value" | "onChange"> {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function KenyanPhoneInput({
  value,
  onChange,
  error,
  className,
  ...props
}: KenyanPhoneInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  // Extract just the digits, remove any +254 or 254 prefix
  const getDigitsOnly = (input: string) => {
    return input.replace(/\D/g, "")
  }

  // Format the phone number display
  const formatPhoneDisplay = (digits: string) => {
    // Remove 254 prefix if present (user might have typed it)
    let clean = digits.replace(/^254/, "")
    // Keep only 9 digits (the local part after +254)
    clean = clean.substring(0, 9)
    return clean
  }

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value
    const digits = getDigitsOnly(input)
    const formatted = formatPhoneDisplay(digits)
    onChange(formatted)
  }

  // Handle paste events to clean up pasted content
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text")
    const digits = getDigitsOnly(pasted)
    const formatted = formatPhoneDisplay(digits)
    onChange(formatted)
  }

  // Build the full phone number (with +254 prefix) for validation
  const fullPhoneNumber = value ? `+254${value}` : ""
  const isValid = value.length === 9 && /^\d{9}$/.test(value)

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex items-center rounded-md border transition-colors",
          isFocused ? "border-ring ring-1 ring-ring/50" : "border-input",
          error ? "border-destructive ring-destructive/20 ring-1" : "",
          "bg-transparent overflow-hidden"
        )}
      >
        {/* Kenya Flag & Country Code */}
        <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground border-r border-input bg-muted/20">
          <span className="text-lg">🇰🇪</span>
          <span className="text-xs font-semibold">+254</span>
        </div>

        {/* Input Field */}
        <input
          type="tel"
          inputMode="numeric"
          placeholder="700 000 000"
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={9}
          className={cn(
            "flex-1 h-9 px-3 py-1 text-base outline-none bg-transparent placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "md:text-sm"
          )}
          {...props}
        />

        {/* Status Indicator */}
        {value.length > 0 && (
          <div className="pr-3">
            {isValid ? (
              <span className="text-green-600 font-semibold text-sm">✓</span>
            ) : (
              <span className="text-amber-500 text-sm">{value.length}/9</span>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive font-medium flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      {/* Helper Text */}
      {!error && (
        <p className="text-xs text-muted-foreground">
          {isValid
            ? `Full number: ${fullPhoneNumber}`
            : "Enter 9 digits (700 000 000 format)"}
        </p>
      )}
    </div>
  )
}
