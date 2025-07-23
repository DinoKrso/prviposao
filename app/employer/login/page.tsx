"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Briefcase, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"

interface LoginResponse {
  success: boolean
  message: string
  token?: string
  user?: {
    id: string
    email: string
    role: string
    profile: any
  }
  error?: string
}

export default function EmployerLoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const result: LoginResponse = await response.json()

      if (result.success && result.token && result.user) {
        setSuccess("Login successful! Redirecting...")

        // Use the auth context to set the session
        login(result.token, result.user)

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/employer/dashboard")
        }, 1500)
      } else {
        setError(result.message || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-dark-primary flex items-center justify-center px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl bg-dark-secondary border-dark-accent">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-brand-orange to-brand-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Prijava Poslodavca</CardTitle>
              <CardDescription className="text-gray-300">
                Pristupite vašoj kontrolnoj tabli za upravljanje oglasima
              </CardDescription>
            </CardHeader>
            <CardContent>

              {/* Error Alert */}
              {error && (
                <Alert className="mb-4 border-red-500/20 bg-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert className="mb-4 border-green-500/20 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-400">{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="poslodavac@kompanija.ba"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-dark-tertiary border-dark-accent text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Lozinka
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Unesite vašu lozinku"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-dark-tertiary border-dark-accent text-white placeholder:text-gray-400"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-brand-orange"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      disabled={isLoading}
                      className="border-dark-accent data-[state=checked]:bg-brand-orange"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-300">
                      Zapamti me
                    </Label>
                  </div>
                  <Link href="/employer/forgot-password" className="text-sm text-brand-orange hover:text-brand-yellow">
                    Zaboravili ste lozinku?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-orange hover:bg-brand-yellow text-white smooth-hover border-0 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Prijavljivanje...
                    </>
                  ) : (
                    "Prijavite se"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  {"Nemate račun? "}
                  <Link href="/employer/register" className="text-brand-orange hover:text-brand-yellow font-medium">
                    Registrujte se ovdje
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </>
  )
}
