"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, X, Briefcase, Loader2, AlertCircle, CheckCircle, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"

const jobTypes = ["Puno radno vrijeme", "Skraćeno radno vrijeme", "Praksa"]

const categories = [
  "IT",
  "Marketing",
  "Dizajn",
  "Analitika",
  "Prodaja",
  "Proizvod",
  "Operacije",
  "Finansije",
  "HR",
  "Ostalo",
]

const locations = [
  "Sarajevo, BiH",
  "Banja Luka, BiH",
  "Mostar, BiH",
  "Tuzla, BiH",
  "Zenica, BiH",
  "Bijeljina, BiH",
  "Brčko, BiH",
  "Trebinje, BiH",
  "Udaljeno",
  "Hibridno",
]

const expirationOptions = [
  { value: "7", label: "7 dana" },
  { value: "14", label: "14 dana" },
  { value: "30", label: "30 dana" },
  { value: "60", label: "60 dana" },
  { value: "90", label: "90 dana" },
]

interface JobFormData {
  title: string
  location: string
  type: string
  category: string
  level: string
  description: string
  requirements: string[]
  benefits: string[]
  salary: string
  applicationUrl: string
  expirationDays: string
}

export default function PostJobPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, token } = useAuth()

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    location: "",
    type: "",
    category: "",
    level: "Junior",
    description: "",
    requirements: [],
    benefits: [],
    salary: "",
    applicationUrl: "",
    expirationDays: "30",
  })

  const [newRequirement, setNewRequirement] = useState("")
  const [newBenefit, setNewBenefit] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/employer/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    // Pre-fill application URL with company email
    if (user?.email && !formData.applicationUrl) {
      setFormData((prev) => ({
        ...prev,
        applicationUrl: `mailto:${user.email}`,
      }))
    }
  }, [user, formData.applicationUrl])

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }))
      setNewRequirement("")
    }
  }

  const removeRequirement = (requirement: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((req) => req !== requirement),
    }))
  }

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()],
      }))
      setNewBenefit("")
    }
  }

  const removeBenefit = (benefit: string) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((ben) => ben !== benefit),
    }))
  }

  const getExpirationDate = () => {
    const days = Number.parseInt(formData.expirationDays)
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + days)
    return expirationDate.toLocaleDateString("bs-BA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    // Validation
    if (formData.title.toLowerCase().includes("senior")) {
      setError("Nije dozvoljeno unositi pozicije koje sadrže riječ 'Senior' u nazivu pozicije.")
      setIsSubmitting(false)
      return
    }
    if (!formData.title || !formData.location || !formData.type || !formData.category || !formData.description) {
      setError("Molimo popunite sva obavezna polja")
      setIsSubmitting(false)
      return
    }

    if (!user?._id && !user?.id) {
      setError("Korisničke informacije nisu dostupne")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          company: user.profile.company || "Nepoznata kompanija",
          employerId: user.id || user._id,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess("Oglas je uspješno objavljen!")

        // Redirect to dashboard after success
        setTimeout(() => {
          router.push("/employer/dashboard")
        }, 2000)
      } else {
        setError(result.message || "Greška pri objavljivanju oglasa")
      }
    } catch (error) {
      console.error("Job posting error:", error)
      setError("Mrežna greška. Molimo pokušajte ponovo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center pt-16">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <>
      <div className="min-h-screen bg-dark-primary pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-brand-orange to-brand-yellow rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Objavi Novi Posao</h1>
                <p className="text-gray-300">Pronađite najbolje junior talente za vašu kompaniju</p>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-dark-secondary border-dark-accent">
              <CardHeader>
                <CardTitle className="text-white">Detalji Pozicije</CardTitle>
                <CardDescription className="text-gray-300">
                  Popunite informacije o poziciji koju želite objaviti
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Error Alert */}
                {error && (
                  <Alert className="mb-6 border-red-500/20 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Success Alert */}
                {success && (
                  <Alert className="mb-6 border-green-500/20 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-400">{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-white">
                        Naziv Pozicije *
                      </Label>
                      <Input
                        id="title"
                        placeholder="npr. Junior Frontend Developer"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="bg-dark-tertiary border-dark-accent text-white placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-white">
                        Lokacija *
                      </Label>
                      <Select
                        value={formData.location}
                        onValueChange={(value) => handleInputChange("location", value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="bg-dark-tertiary border-dark-accent text-white">
                          <SelectValue placeholder="Odaberite lokaciju" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-secondary border-dark-accent">
                          {locations.map((location) => (
                            <SelectItem key={location} value={location} className="text-white hover:bg-dark-tertiary">
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-white">
                        Tip Posla *
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => handleInputChange("type", value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="bg-dark-tertiary border-dark-accent text-white">
                          <SelectValue placeholder="Odaberite tip" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-secondary border-dark-accent">
                          {jobTypes.map((type) => (
                            <SelectItem key={type} value={type} className="text-white hover:bg-dark-tertiary">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-white">
                        Kategorija *
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleInputChange("category", value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="bg-dark-tertiary border-dark-accent text-white">
                          <SelectValue placeholder="Odaberite kategoriju" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-secondary border-dark-accent">
                          {categories.map((category) => (
                            <SelectItem key={category} value={category} className="text-white hover:bg-dark-tertiary">
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="level" className="text-white">
                        Nivo
                      </Label>
                      <Select
                        value={formData.level}
                        onValueChange={(value) => handleInputChange("level", value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="bg-dark-tertiary border-dark-accent text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-secondary border-dark-accent">
                          <SelectItem value="Junior" className="text-white hover:bg-dark-tertiary">
                            Junior
                          </SelectItem>
                          <SelectItem value="Praksa" className="text-white hover:bg-dark-tertiary">
                            Praksa
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Salary, Application URL, and Expiration */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="salary" className="text-white">
                        Plata
                      </Label>
                      <Input
                        id="salary"
                        placeholder="npr. 1.500 - 2.000 KM"
                        value={formData.salary}
                        onChange={(e) => handleInputChange("salary", e.target.value)}
                        disabled={isSubmitting}
                        className="bg-dark-tertiary border-dark-accent text-white placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="applicationUrl" className="text-white">
                        Link za Prijavu
                      </Label>
                      <Input
                        id="applicationUrl"
                        placeholder="mailto:hr@kompanija.ba ili https://..."
                        value={formData.applicationUrl}
                        onChange={(e) => handleInputChange("applicationUrl", e.target.value)}
                        disabled={isSubmitting}
                        className="bg-dark-tertiary border-dark-accent text-white placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expirationDays" className="text-white">
                        Oglas Istječe
                      </Label>
                      <Select
                        value={formData.expirationDays}
                        onValueChange={(value) => handleInputChange("expirationDays", value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="bg-dark-tertiary border-dark-accent text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-secondary border-dark-accent">
                          {expirationOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="text-white hover:bg-dark-tertiary"
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Oglas će isteći: {getExpirationDate()}
                      </p>
                    </div>
                  </div>

                  {/* Job Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">
                      Opis Posla *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Opišite poziciju, odgovornosti, zahtjeve..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      required
                      disabled={isSubmitting}
                      rows={8}
                      className="bg-dark-tertiary border-dark-accent text-white placeholder:text-gray-400"
                    />
                  </div>

                  {/* Requirements */}
                  <div className="space-y-4">
                    <Label className="text-white">Potrebne Vještine</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Dodajte vještinu (npr. React, JavaScript)"
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                        disabled={isSubmitting}
                        className="bg-dark-tertiary border-dark-accent text-white placeholder:text-gray-400"
                      />
                      <Button
                        type="button"
                        onClick={addRequirement}
                        disabled={isSubmitting}
                        className="bg-brand-orange hover:bg-brand-yellow text-white border-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.requirements.map((req, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-brand-orange/30 text-brand-orange bg-brand-orange/10 flex items-center gap-1"
                          >
                            {req}
                            <button
                              type="button"
                              onClick={() => removeRequirement(req)}
                              disabled={isSubmitting}
                              className="ml-1 hover:text-red-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Benefits */}
                  <div className="space-y-4">
                    <Label className="text-white">Benefiti</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Dodajte benefit (npr. Fleksibilno radno vrijeme)"
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())}
                        disabled={isSubmitting}
                        className="bg-dark-tertiary border-dark-accent text-white placeholder:text-gray-400"
                      />
                      <Button
                        type="button"
                        onClick={addBenefit}
                        disabled={isSubmitting}
                        className="bg-brand-orange hover:bg-brand-yellow text-white border-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.benefits.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.benefits.map((benefit, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-green-500/30 text-green-400 bg-green-500/10 flex items-center gap-1"
                          >
                            {benefit}
                            <button
                              type="button"
                              onClick={() => removeBenefit(benefit)}
                              disabled={isSubmitting}
                              className="ml-1 hover:text-red-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/employer/dashboard")}
                      disabled={isSubmitting}
                      className="border-dark-accent text-gray-300 hover:bg-dark-tertiary hover:text-white bg-transparent"
                    >
                      Otkaži
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-brand-orange hover:bg-brand-yellow text-white border-0 flex items-center justify-center flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Objavljivanje...
                        </>
                      ) : (
                        <>
                          <Briefcase className="w-4 h-4 mr-2" />
                          Objavi Posao
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  )
}
