"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Building2 } from "lucide-react"
import { motion } from "framer-motion"
import { Footer } from "@/components/footer"

const companySizes = [
  "1-10 zaposlenih",
  "11-50 zaposlenih",
  "51-200 zaposlenih",
  "201-500 zaposlenih",
  "500+ zaposlenih",
]

const industries = [
  "Tehnologija",
  "Zdravstvo",
  "Finansije",
  "Obrazovanje",
  "Trgovina",
  "Proizvodnja",
  "Konsalting",
  "Mediji i zabava",
  "Ostalo",
]

export default function EmployerRegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companySize: "",
    industry: "",
    website: "",
    description: "",
    agreeToTerms: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("Lozinke se ne poklapaju!")
      return
    }
    if (!formData.agreeToTerms) {
      alert("Molimo prihvatite uslove korištenja")
      return
    }
    console.log("Registration attempt:", formData)
  }

  return (
    <>
      <div className="min-h-screen bg-dark-primary flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <Card className="shadow-xl bg-dark-secondary border-dark-accent">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-brand-orange to-brand-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Registracija Poslodavca</CardTitle>
              <CardDescription className="text-gray-300">
                Pridružite se našoj platformi za objavljivanje junior pozicija i praksi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-white">
                      Naziv Kompanije *
                    </Label>
                    <Input
                      id="companyName"
                      placeholder="Vaša Kompanija d.o.o."
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      required
                      className="bg-dark-tertiary border-dark-accent text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactName" className="text-white">
                      Ime Kontakt Osobe *
                    </Label>
                    <Input
                      id="contactName"
                      placeholder="Marko Marković"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange("contactName", e.target.value)}
                      required
                      className="bg-dark-tertiary border-dark-accent text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email Adresa *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="hr@kompanija.ba"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="bg-dark-tertiary border-dark-accent text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">
                      Lozinka *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Kreirajte lozinku"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required
                        className="bg-dark-tertiary border-dark-accent text-white placeholder:text-gray-400"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-brand-orange"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">
                      Potvrdite Lozinku *
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Potvrdite vašu lozinku"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        required
                        className="bg-dark-tertiary border-dark-accent text-white placeholder:text-gray-400"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-brand-orange"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companySize" className="text-white">
                      Veličina Kompanije
                    </Label>
                    <Select
                      value={formData.companySize}
                      onValueChange={(value) => handleInputChange("companySize", value)}
                    >
                      <SelectTrigger className="bg-dark-tertiary border-dark-accent text-white">
                        <SelectValue placeholder="Odaberite veličinu kompanije" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-secondary border-dark-accent">
                        {companySizes.map((size) => (
                          <SelectItem key={size} value={size} className="text-white hover:bg-dark-tertiary">
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-white">
                      Industrija
                    </Label>
                    <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                      <SelectTrigger className="bg-dark-tertiary border-dark-accent text-white">
                        <SelectValue placeholder="Odaberite industriju" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-secondary border-dark-accent">
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry} className="text-white hover:bg-dark-tertiary">
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-white">
                    Web Stranica Kompanije
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.kompanija.ba"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    className="bg-dark-tertiary border-dark-accent text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Opis Kompanije
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Recite nam o vašoj kompaniji i što je čini odličnim mjestom za junior talente..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    className="bg-dark-tertiary border-dark-accent text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                    className="border-dark-accent data-[state=checked]:bg-brand-orange"
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-300">
                    Slažem se sa{" "}
                    <Link href="/terms" className="text-brand-orange hover:text-brand-yellow">
                      Uslovima Korištenja
                    </Link>{" "}
                    i{" "}
                    <Link href="/privacy" className="text-brand-orange hover:text-brand-yellow">
                      Politikom Privatnosti
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  variant="orange"
                  className="w-full smooth-hover border-0 flex items-center justify-center"
                  size="lg"
                >
                  Kreiraj Račun
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Već imate račun?{" "}
                  <Link href="/employer/login" className="text-brand-orange hover:text-brand-yellow font-medium">
                    Prijavite se ovdje
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
