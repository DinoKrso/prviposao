"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Briefcase,
  Users,
  Eye,
  Plus,
  Settings,
  Building2,
  Mail,
  Globe,
  Calendar,
  MapPin,
  Clock,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"

interface Job {
  _id: string
  title: string
  company: string
  location: string
  type: string
  category: string
  level: string
  salary: string
  isActive: boolean
  expiresAt: string
  createdAt: string
}

interface EmployerStats {
  activeJobs: number
  expiredJobs: number
  totalViews: number
  totalApplications: number
  totalJobs: number
}

export default function EmployerDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, token } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<EmployerStats>({
    activeJobs: 0,
    expiredJobs: 0,
    totalViews: 0,
    totalApplications: 0,
    totalJobs: 0,
  })
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState("")
  const [deleteSuccess, setDeleteSuccess] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/employer/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchEmployerJobs()
    }
  }, [isAuthenticated, token])

  const fetchEmployerJobs = async () => {
    try {
      const response = await fetch("/api/employer/jobs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        setJobs(result.jobs)
        setStats(result.stats)
      }
    } catch (error) {
      console.error("Failed to fetch employer jobs:", error)
    } finally {
      setIsLoadingJobs(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    setDeletingJobId(jobId)
    setDeleteError("")
    setDeleteSuccess("")

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        setDeleteSuccess("Oglas je uspješno obrisan!")
        // Remove the job from the list
        setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId))
        // Update stats
        setStats((prevStats) => ({
          ...prevStats,
          totalJobs: prevStats.totalJobs - 1,
          activeJobs: prevStats.activeJobs - 1,
        }))

        // Clear success message after 3 seconds
        setTimeout(() => setDeleteSuccess(""), 3000)
      } else {
        setDeleteError(result.message || "Greška pri brisanju oglasa")
      }
    } catch (error) {
      console.error("Failed to delete job:", error)
      setDeleteError("Mrežna greška. Molimo pokušajte ponovo.")
    } finally {
      setDeletingJobId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("bs-BA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isJobExpired = (expiresAt: string) => {
    return new Date(expiresAt) <= new Date()
  }

  const getDaysUntilExpiration = (expiresAt: string) => {
    const expiration = new Date(expiresAt)
    const now = new Date()
    const diffTime = expiration.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Dobrodošli, {user.profile.contactName || user.profile.name}!
                </h1>
                <p className="text-gray-300">Upravljajte vašim oglasima i pronađite najbolje junior talente</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button
                  className="bg-brand-orange hover:bg-brand-yellow text-white border-0"
                  onClick={() => router.push("/employer/post-job")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Objavi Posao
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Alerts */}
          {deleteError && (
            <Alert className="mb-6 border-red-500/20 bg-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">{deleteError}</AlertDescription>
            </Alert>
          )}

          {deleteSuccess && (
            <Alert className="mb-6 border-green-500/20 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-400">{deleteSuccess}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <Card className="bg-dark-secondary border-dark-accent">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Aktivni Oglasi</p>
                    <p className="text-2xl font-bold text-white">{stats.activeJobs}</p>
                  </div>
                  <div className="w-12 h-12 bg-brand-orange/20 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-brand-orange" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary border-dark-accent">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Istekli Oglasi</p>
                    <p className="text-2xl font-bold text-white">{stats.expiredJobs}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary border-dark-accent">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Ukupno Pregleda</p>
                    <p className="text-2xl font-bold text-white">{stats.totalViews}</p>
                  </div>
                  <div className="w-12 h-12 bg-brand-yellow/20 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-brand-yellow" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary border-dark-accent">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Prijave</p>
                    <p className="text-2xl font-bold text-white">{stats.totalApplications}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Company Profile */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-1"
            >
              <Card className="bg-dark-secondary border-dark-accent">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-brand-orange" />
                    Profil Kompanije
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {user.profile.company || "Naziv kompanije"}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      {user.profile.description || "Opis kompanije nije dostupan"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Mail className="w-4 h-4 text-brand-orange" />
                      <span>{user.email}</span>
                    </div>

                    {user.profile.website && (
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Globe className="w-4 h-4 text-brand-orange" />
                        <a
                          href={user.profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-brand-orange transition-colors"
                        >
                          {user.profile.website}
                        </a>
                      </div>
                    )}

                    {user.profile.industry && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-brand-orange/30 text-brand-orange">
                          {user.profile.industry}
                        </Badge>
                      </div>
                    )}

                    {user.profile.companySize && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-dark-accent text-gray-300">
                          {user.profile.companySize}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-dark-accent text-gray-300 hover:bg-dark-tertiary hover:text-brand-orange bg-transparent"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Uredi Profil
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Jobs */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="lg:col-span-2"
            >
              <Card className="bg-dark-secondary border-dark-accent">
                <CardHeader>
                  <CardTitle className="text-white">Vaši Oglasi</CardTitle>
                  <CardDescription className="text-gray-300">
                    Upravljajte vašim aktivnim oglasima za posao
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingJobs ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400">Učitavanje oglasa...</div>
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="text-center py-12">
                      <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Nemate aktivnih oglasa</h3>
                      <p className="text-gray-400 mb-6">
                        Objavite vaš prvi oglas za posao i počnite privlačiti junior talente
                      </p>
                      <Button
                        className="bg-brand-orange hover:bg-brand-yellow text-white border-0"
                        onClick={() => router.push("/employer/post-job")}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Objavi Prvi Posao
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {jobs.slice(0, 5).map((job) => {
                        const expired = isJobExpired(job.expiresAt)
                        const daysLeft = getDaysUntilExpiration(job.expiresAt)

                        return (
                          <div
                            key={job._id}
                            className="p-4 bg-dark-tertiary rounded-lg border border-dark-accent hover:border-brand-orange/30 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-white font-medium">{job.title}</h4>
                              <div className="flex items-center gap-2">
                                {expired ? (
                                  <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                                    Istekao
                                  </Badge>
                                ) : daysLeft <= 7 ? (
                                  <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                    {daysLeft} dana
                                  </Badge>
                                ) : (
                                  <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                                    Aktivan
                                  </Badge>
                                )}

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-auto"
                                      disabled={deletingJobId === job._id}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-dark-secondary border-dark-accent">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-white">Obriši Oglas</AlertDialogTitle>
                                      <AlertDialogDescription className="text-gray-300">
                                        Da li ste sigurni da želite obrisati oglas "{job.title}"? Ova akcija se ne može
                                        poništiti.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="border-dark-accent text-gray-300 hover:bg-dark-tertiary">
                                        Otkaži
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteJob(job._id)}
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                      >
                                        Obriši
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{job.type}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Istječe: {formatDate(job.expiresAt)}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-brand-orange/30 text-brand-orange text-xs">
                                  {job.category}
                                </Badge>
                                <Badge variant="outline" className="border-dark-accent text-gray-300 text-xs">
                                  {job.level}
                                </Badge>
                              </div>
                              <span className="text-xs text-brand-orange font-medium">{job.salary}</span>
                            </div>
                          </div>
                        )
                      })}

                      {jobs.length > 5 && (
                        <div className="text-center pt-4">
                          <Button
                            variant="outline"
                            className="border-dark-accent text-gray-300 hover:bg-dark-tertiary hover:text-brand-orange bg-transparent"
                          >
                            Pogledaj Sve Oglase ({jobs.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
