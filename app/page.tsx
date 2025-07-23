"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Users,
  TrendingUp,
  Filter,
  MapPin,
  Clock,
  Building2,
  X,
  Calendar,
  DollarSign,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { HeroSection } from "@/components/hero-section"
import { Footer } from "@/components/footer"

// Job interface matching our database model
interface Job {
  _id: string
  title: string
  company: string
  companyLogo?: string
  location: string
  type: string
  category: string
  level: string
  description: string
  requirements: string[]
  benefits: string[]
  salary: string
  applicationUrl: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  expiresAt: string
}

interface JobsResponse {
  success: boolean
  jobs: Job[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

const categories = [
  "Sve",
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
const jobTypes = ["Sve", "Puno radno vrijeme", "Skraćeno radno vrijeme", "Praksa"]
const locations = [
  "Sve",
  "Udaljeno",
  "Hibridno",
  "Sarajevo, BiH",
  "Banja Luka, BiH",
  "Mostar, BiH",
  "Tuzla, BiH",
  "Zenica, BiH",
  "Bijeljina, BiH",
  "Brčko, BiH",
  "Trebinje, BiH",
]
const formatExpirationDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return "Istekao"
  if (diffDays === 0) return "Danas"
  if (diffDays === 1) return "Sutra"
  if (diffDays < 7) return `${diffDays} dana`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} sedmica`
  return `${Math.ceil(diffDays / 30)} mjeseci`
}

export default function HomePage() {
  const { scrollY } = useScroll()
  const y2 = useTransform(scrollY, [0, 300], [0, -100])

  // Search state
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Sve")
  const [selectedType, setSelectedType] = useState("Sve")
  const [selectedLocation, setSelectedLocation] = useState("Sve")
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [totalJobs, setTotalJobs] = useState(0)

  // Fetch jobs from API
  const fetchJobs = async () => {
    setIsLoading(true)

    try {
      const params = new URLSearchParams()

      if (searchTerm) params.append("search", searchTerm)
      if (selectedCategory !== "Sve") params.append("category", selectedCategory)
      if (selectedType !== "Sve") params.append("type", selectedType)
      if (selectedLocation !== "Sve") params.append("location", selectedLocation)

      // Limit to 6 jobs for homepage
      params.append("limit", "6")

      const response = await fetch(`/api/jobs?${params.toString()}`)
      const result: JobsResponse = await response.json()

      if (result.success) {
        setJobs(result.jobs)
        setTotalJobs(result.pagination.total)
        // Set first job as selected if available
        if (result.jobs.length > 0 && !selectedJob) {
          setSelectedJob(result.jobs[0])
        }
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch jobs on component mount and when filters change
  useEffect(() => {
    fetchJobs()
  }, [searchTerm, selectedCategory, selectedType, selectedLocation])

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedCategory("Sve")
    setSelectedType("Sve")
    setSelectedLocation("Sve")
  }

  const hasActiveFilters =
    searchTerm || selectedCategory !== "Sve" || selectedType !== "Sve" || selectedLocation !== "Sve"

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "prije 1 dan"
    if (diffDays < 7) return `prije ${diffDays} dana`
    if (diffDays < 14) return "prije 1 sedmicu"
    if (diffDays < 30) return `prije ${Math.ceil(diffDays / 7)} sedmica`
    return `prije ${Math.ceil(diffDays / 30)} mjeseci`
  }

 

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <motion.section className="py-20 px-4 bg-dark-secondary" style={{ y: y2 }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Briefcase, number: `${totalJobs}+`, label: "Junior Pozicije" },
              { icon: GraduationCap, number: `${Math.floor(totalJobs * 0.4)}+`, label: "Prakse" },
              { icon: Users, number: "100+", label: "Kompanije" },
              { icon: TrendingUp, number: "95%", label: "Stopa Uspjeha" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center smooth-hover"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-dark-tertiary rounded-full mb-4 border border-brand-orange/20">
                  <stat.icon className="w-8 h-8 text-brand-orange" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Job Search Section */}
      <section className="py-20 px-4 bg-dark-tertiary">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Pregledajte Junior Prilike</h2>
            <p className="text-lg md:text-xl text-gray-300 mb-2">
              {isLoading ? "Učitavanje..." : `${totalJobs} dostupnih pozicija`}
            </p>
            <Badge className="text-sm bg-brand-orange text-white hover:bg-brand-yellow">
              Samo Junior i Praktikantske Pozicije
            </Badge>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="glass-effect rounded-lg p-4 md:p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-brand-orange" />
                <h3 className="text-lg font-semibold text-white">Filtriraj Poslove</h3>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-400 hover:text-brand-orange hover:bg-dark-secondary/50 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Obriši sve filtere
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pretraga</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Pretražite poslove..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-dark-secondary border-dark-accent text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Kategorija</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-dark-secondary border-dark-accent text-white">
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tip Posla</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="bg-dark-secondary border-dark-accent text-white">
                    <SelectValue placeholder="Odaberite tip posla" />
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Lokacija</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="bg-dark-secondary border-dark-accent text-white">
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
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
              <span className="ml-2 text-white">Učitavanje poslova...</span>
            </div>
          )}

          {/* Desktop Layout - Side by Side */}
          {!isLoading && (
            <div className="hidden lg:grid lg:grid-cols-5 gap-6">
              {/* Left Panel - Job List */}
              <div className="lg:col-span-2">
                <JobList jobs={jobs} selectedJob={selectedJob} onJobSelect={setSelectedJob} />
              </div>

              {/* Right Panel - Job Details */}
              <div className="lg:col-span-3">
                {selectedJob ? (
                  <JobDetailsPanel job={selectedJob} />
                ) : (
                  <div className="bg-dark-secondary rounded-lg border border-dark-accent p-8 text-center">
                    <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Odaberite posao</h3>
                    <p className="text-gray-400">Kliknite na posao sa lijeve strane da vidite detalje</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile Layout - Job List Only */}
          {!isLoading && (
            <div className="lg:hidden">
              <MobileJobList jobs={jobs} />
            </div>
          )}

          {/* View All Jobs Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Button
              size="lg"
              className="text-lg px-8 py-4 bg-brand-orange hover:bg-brand-yellow text-white smooth-hover border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href="/jobs" className="flex items-center gap-2">
                Pogledaj Sve Poslove ({totalJobs})
                <ExternalLink className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-brand-orange to-brand-yellow">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Spremni za zapošljavanje junior talenata?</h2>
          <p className="text-xl text-white/90 mb-8">
            Pridružite se stotinama kompanija koje pronalaze svoje sljedeće junior developere i praktikante
          </p>
          <Button
            size="lg"
            className="text-lg px-8 py-3 bg-dark-primary hover:bg-dark-secondary text-white smooth-hover border-0 inline-flex items-center justify-center"
          >
            <Link href="/employer/login" className="flex items-center">
              Objavite Posao
            </Link>
          </Button>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}

// Job List Component for Desktop (Same as Jobs Page)
function JobList({
  jobs,
  selectedJob,
  onJobSelect,
}: {
  jobs: Job[]
  selectedJob: Job | null
  onJobSelect: (job: Job) => void
}) {
  return (
    <div className="bg-dark-secondary rounded-lg border border-dark-accent max-h-[800px] overflow-hidden">
      <div className="p-4 border-b border-dark-accent">
        <h3 className="text-lg font-semibold text-white">Poslovi ({jobs.length})</h3>
      </div>

      <div className="overflow-y-auto max-h-[720px] custom-scrollbar">
        <AnimatePresence>
          {jobs.map((job, index) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-4 border-b border-dark-accent cursor-pointer transition-all duration-200 hover:bg-dark-tertiary/50 ${
                selectedJob?._id === job._id ? "bg-dark-tertiary border-l-4 border-l-brand-orange" : ""
              }`}
              onClick={() => onJobSelect(job)}
            >
              <JobCard job={job} />
            </motion.div>
          ))}
        </AnimatePresence>

        {jobs.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-white mb-2">Nema pronađenih poslova</h3>
            <p className="text-gray-400">Pokušajte prilagoditi vaše filtere</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Mobile Job List Component
function MobileJobList({ jobs }: { jobs: Job[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Poslovi ({jobs.length})</h3>
      </div>

      <AnimatePresence>
        {jobs.map((job, index) => (
          <motion.div
            key={job._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-dark-secondary rounded-lg border border-dark-accent p-4 cursor-pointer transition-all duration-200 hover:bg-dark-tertiary/50 hover:border-brand-orange/30 hover:shadow-lg hover:shadow-brand-orange/10"
          >
            <JobCard job={job} showFullDetails />
          </motion.div>
        ))}
      </AnimatePresence>

      {jobs.length === 0 && (
        <div className="bg-dark-secondary rounded-lg border border-dark-accent p-8 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-white mb-2">Nema pronađenih poslova</h3>
          <p className="text-gray-400">Pokušajte prilagoditi vaše filtere</p>
        </div>
      )}
    </div>
  )
}

// Reusable Job Card Component (Same as Jobs Page)
function JobCard({
  job,
  showFullDetails = false,
}: {
  job: Job
  showFullDetails?: boolean
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "prije 1 dan"
    if (diffDays < 7) return `prije ${diffDays} dana`
    if (diffDays < 14) return "prije 1 sedmicu"
    if (diffDays < 30) return `prije ${Math.ceil(diffDays / 7)} sedmica`
    return `prije ${Math.ceil(diffDays / 30)} mjeseci`
  }

  return (
    <div className="flex items-start gap-3">
      <img
        src={job.companyLogo || "/placeholder.svg?height=48&width=48&text=" + job.company.substring(0, 2).toUpperCase()}
        alt={`Logo kompanije ${job.company} - junior pozicija, prvi posao, praksa`}
        className="w-12 h-12 rounded-lg bg-dark-accent flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <h4 className="text-white font-medium text-sm truncate pr-2">{job.title}</h4>
          <Badge
            className={`text-xs flex-shrink-0 ${
              job.level === "Praksa" ? "bg-brand-yellow text-dark-primary" : "bg-brand-orange text-white"
            }`}
          >
            {job.level}
          </Badge>
        </div>
        <p className="text-gray-300 text-sm mb-1">{job.company}</p>
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{job.type}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{formatDate(job.createdAt)}</span>
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium text-brand-orange">{job.salary}</span>
            <span className="text-xs text-gray-500">Ističe: {formatExpirationDate(job.expiresAt)}</span>
          </div>
        </div>
        {showFullDetails && (
          <div className="mt-3 pt-3 border-t border-dark-accent">
            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
              {job.description.replace(/<[^>]*>/g, "").substring(0, 120)}...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Desktop Job Details Panel (Same as Jobs Page)
function JobDetailsPanel({ job }: { job: Job }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={job._id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="bg-dark-secondary rounded-lg border border-dark-accent overflow-hidden"
      >
        <JobDetailsContent job={job} />
      </motion.div>
    </AnimatePresence>
  )
}

// Reusable Job Details Content (Same as Jobs Page)
function JobDetailsContent({ job }: { job: Job }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "prije 1 dan"
    if (diffDays < 7) return `prije ${diffDays} dana`
    if (diffDays < 14) return "prije 1 sedmicu"
    if (diffDays < 30) return `prije ${Math.ceil(diffDays / 7)} sedmica`
    return `prije ${Math.ceil(diffDays / 30)} mjeseci`
  }

  return (
    <>
      {/* Job Header */}
      <div className="p-6 border-b border-dark-accent">
        <div className="flex items-start gap-4 mb-4">
          <img
            src={
              job.companyLogo || "/placeholder.svg?height=64&width=64&text=" + job.company.substring(0, 2).toUpperCase()
            }
            alt={`Logo kompanije ${job.company} - junior pozicija, prvi posao, praksa`}
            className="w-16 h-16 rounded-lg bg-dark-accent flex-shrink-0"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">{job.title}</h1>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-lg text-gray-300">{job.company}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{job.type}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(job.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span className="font-medium text-brand-orange">{job.salary}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-red-400" />
                <span className="text-red-400">Ističe: {formatExpirationDate(job.expiresAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="bg-brand-orange text-white">Samo {job.level}</Badge>
          <Badge variant="outline" className="border-dark-accent text-gray-300">
            {job.category}
          </Badge>
        </div>

        {/* Apply Button */}
        <Button
          className="w-full bg-brand-orange hover:bg-brand-yellow text-white transition-colors duration-200 border-0"
          size="lg"
          onClick={() => window.open(job.applicationUrl, "_blank")}
        >
          Prijavite se sada
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Job Content */}
      <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
        {/* Requirements */}
        {job.requirements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-brand-orange" />
              Potrebne vještine
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.requirements.map((req, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="border-brand-orange/30 text-brand-orange bg-brand-orange/10"
                >
                  {req}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Benefits */}
        {job.benefits.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-orange" />
              Benefiti
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {job.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Job Description */}
        <div className="prose prose-invert max-w-none">
          <div className="text-gray-300 leading-relaxed job-description">
            {job.description.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
