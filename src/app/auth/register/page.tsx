"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageRoutes } from "@/constants/page-routes"
import { AuthAlertBanner } from "@/components/auth/AuthAlertBanner"

type UserRole = "TENANT" | "LANDLORD"

function getErrorMessage(data: unknown) {
  if (!data || typeof data !== "object") return "Registration failed."
  const obj = data as Record<string, unknown>
  if (typeof obj.error === "string") return obj.error
  if (typeof obj.detail === "string") return obj.detail

  const firstField = Object.values(obj).find((value) => {
    if (typeof value === "string" && value.trim()) return true
    if (Array.isArray(value) && typeof value[0] === "string") return true
    return false
  })

  if (typeof firstField === "string") return firstField
  if (Array.isArray(firstField) && typeof firstField[0] === "string") return firstField[0]
  return "Registration failed."
}

export default function RegisterPage() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<UserRole>("TENANT")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [nationalIdImage, setNationalIdImage] = useState<File | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)

    if (!username || !email || !password) {
      setError("Please fill all required fields.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      // Build FormData
      const formData = new FormData()
      formData.append("username", username)
      formData.append("full_name", fullName)
      formData.append("email", email)
      formData.append("phone_number", phone)
      formData.append("role", role)
      formData.append("password", password)
      formData.append("password2", confirmPassword)

      if (role === "LANDLORD") {
        formData.append("national_id", nationalId)
        if (nationalIdImage) {
          formData.append("national_id_image", nationalIdImage)
        }
      }

      // Send request (no CSRF, no session — Token auth)
      const res = await fetch("http://127.0.0.1:8000/api/auth/register", {
        method: "POST",
        body: formData,
      })

      // Handle non-JSON safely
      const text = await res.text()
      let data

      try {
        data = JSON.parse(text)
      } catch {
        console.error("Server returned HTML:", text)
        throw new Error("Server error. Check backend.")
      }

      if (!res.ok) throw new Error(getErrorMessage(data))

      // SUCCESS
      setSuccess("Account created. Verify your email OTP to activate sign in.")

      setTimeout(() => {
        router.push(`/auth/verify-otp?email=${encodeURIComponent(email.trim())}&from=register`)
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-lg">

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold mb-3">
              Create account
            </h1>
            <p className="text-muted-foreground">
              Choose a role to continue
            </p>
          </motion.div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6 space-y-5">

              <input
                type="text"
                placeholder="Username *"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              />

              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              />

              <input
                type="email"
                placeholder="Email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              />

              <input
                type="text"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              />

              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-4 py-3 border rounded-lg"
              >
                <option value="TENANT">Tenant</option>
                <option value="LANDLORD">Landlord</option>
              </select>

              {role === "LANDLORD" && (
                <>
                  <input
                    type="text"
                    placeholder="National ID"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                  />

                  <input
                    type="file"
                    onChange={(e) =>
                      setNationalIdImage(e.target.files?.[0] || null)
                    }
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </>
              )}

              <input
                type="password"
                placeholder="Password *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              />

              <input
                type="password"
                placeholder="Confirm password *"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              />

              {error && <AuthAlertBanner tone="error" message={error} />}

              {success && <AuthAlertBanner tone="success" message={success} />}

              <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create account"}
              </Button>

              <p className="text-sm text-center">
                Already have an account?{" "}
                <Link href="/auth/login" className="underline">
                  Sign in
                </Link>
              </p>

            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Link href={PageRoutes.PROPERTIES} className="text-sm underline">
              Continue browsing properties
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}