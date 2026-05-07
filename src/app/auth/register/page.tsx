"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { KenyanPhoneInput } from "@/components/kenyan-phone-input"
import { PageRoutes } from "@/constants/page-routes"
import { AuthAlertBanner } from "@/components/auth/AuthAlertBanner"
import { Eye, EyeOff, FileText, IdCard, Lock, Mail, Upload, User, ChevronDown } from "lucide-react"
import { backendRegister } from "@/lib/api/auth"

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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [nationalId, setNationalId] = useState("")
  const [nationalIdImage, setNationalIdImage] = useState<File | null>(null)
  const [proofOfOwnership, setProofOfOwnership] = useState<File | null>(null)
  const [kraPin, setKraPin] = useState<File | null>(null)

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

    if (role === "LANDLORD") {
      if (!fullName.trim() || !phone.trim() || !nationalId.trim()) {
        setError("Landlord sign up requires full name, phone number and national ID.")
        return
      }
      if (!nationalIdImage || !proofOfOwnership || !kraPin) {
        setError("Landlord sign up requires National ID image, proof of ownership, and KRA PIN document.")
        return
      }
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
        if (proofOfOwnership) {
          formData.append("proof_of_ownership", proofOfOwnership)
        }
        if (kraPin) {
          formData.append("kra_pin", kraPin)
        }
      }

      await backendRegister(formData)

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

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  aria-label="Username"
                  placeholder="Username *"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg pl-10"
                />
              </div>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  aria-label="Full name"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg pl-10"
                />
              </div>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="email"
                  aria-label="Email"
                  placeholder="Email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg pl-10"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Phone number
                </label>
                <KenyanPhoneInput
                  value={phone}
                  onChange={setPhone}
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-4 py-3 border rounded-lg pl-10 pr-10 appearance-none bg-background text-foreground dark:bg-background dark:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Role"
                >
                  <option value="TENANT">Tenant</option>
                  <option value="LANDLORD">Landlord</option>
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/70 dark:text-foreground/70 pointer-events-none z-10"
                />
              </div>

              {role === "LANDLORD" && (
                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
                  <p className="text-sm font-semibold">Landlord verification details</p>
                  <div className="relative">
                    <IdCard
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type="text"
                      aria-label="National ID"
                      placeholder="National ID"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg pl-10"
                    />
                  </div>

                  <label className="block text-sm font-medium">
                    National ID image *
                    <div className="mt-2 relative">
                      <Upload size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => setNationalIdImage(e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 border rounded-lg pl-10"
                      />
                    </div>
                  </label>

                  <label className="block text-sm font-medium">
                    Proof of ownership *
                    <div className="mt-2 relative">
                      <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => setProofOfOwnership(e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 border rounded-lg pl-10"
                      />
                    </div>
                  </label>

                  <label className="block text-sm font-medium">
                    KRA PIN document *
                    <div className="mt-2 relative">
                      <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => setKraPin(e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 border rounded-lg pl-10"
                      />
                    </div>
                  </label>
                </div>
              )}

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  aria-label="Password"
                  placeholder="Password *"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  aria-label="Confirm password"
                  placeholder="Confirm password *"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

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
