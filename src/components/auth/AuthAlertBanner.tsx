"use client"

import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react"

type AuthAlertTone = "error" | "success" | "info"

type AuthAlertBannerProps = {
  tone: AuthAlertTone
  message: string
}

export function AuthAlertBanner({ tone, message }: AuthAlertBannerProps) {
  const toneClass =
    tone === "error"
      ? "border-red-300/80 bg-gradient-to-r from-red-50 to-rose-50 text-red-800"
      : tone === "success"
        ? "border-emerald-300/80 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800"
        : "border-blue-300/80 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900"

  const iconWrapClass =
    tone === "error"
      ? "bg-red-100 text-red-600"
      : tone === "success"
        ? "bg-emerald-100 text-emerald-600"
        : "bg-blue-100 text-blue-600"

  return (
    <div className={`rounded-xl border p-4 text-sm shadow-sm ${toneClass}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-full p-1 ${iconWrapClass}`}>
          {tone === "error" ? (
            <AlertCircle className="h-4 w-4" />
          ) : tone === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </div>
        <p className="font-medium">{message}</p>
      </div>
    </div>
  )
}
