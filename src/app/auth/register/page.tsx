"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageRoutes } from "@/constants/page-routes"

type UserRole = "TENANT" | "LANDLORD"

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
      // ✅ 1. Get CSRF token
      const csrfRes = await fetch("http://127.0.0.1:8000/api/auth/csrf/", {
        credentials: "include",
      })

      const csrfData = await csrfRes.json()
      const csrfToken = csrfData.csrfToken

      // ✅ 2. Build FormData
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

      // ✅ 3. Send request (IMPORTANT FIXES HERE)
      const res = await fetch("http://127.0.0.1:8000/api/auth/register/", {
        method: "POST",
        credentials: "include", // ✅ session auth
        headers: {
          "X-CSRFToken": csrfToken, // ✅ CSRF required
        },
        body: formData,
      })

      // ✅ 4. Handle non-JSON safely
      const text = await res.text()
      let data

      try {
        data = JSON.parse(text)
      } catch {
        console.error("Server returned HTML:", text)
        throw new Error("Server error. Check backend.")
      }

      if (!res.ok) {
        throw new Error(data.error || JSON.stringify(data))
      }

      // ✅ SUCCESS
      setSuccess("Account created successfully! Redirecting to login...")

      setTimeout(() => {
        router.push("/auth/login")
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

              {error && (
                <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-100 text-green-600 rounded-lg text-sm">
                  {success}
                </div>
              )}

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