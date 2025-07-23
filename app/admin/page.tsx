"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, Users, Briefcase, CheckCircle, AlertCircle, Loader2, Eye, Download, X, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { Footer } from "@/components/footer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useRouter } from "next/navigation";

interface SeedResponse {
  success: boolean
  message: string
  data?: {
    employers: number
    jobs: number
  }
  error?: string
}

interface DatabaseStatus {
  success: boolean
  message: string
  database?: string
  collections?: string[]
  stats?: {
    collections: number
    objects: number
    dataSize: number
  }
}

interface ScrapedJob {
  _id: string
  title: string
  company: string
  companyLogo: string
  location: string
  type: string
  category: string
  level: string
  description: string
  requirements: string[]
  benefits: string[]
  salary: string
  applicationUrl: string
  expiresAt: string
  isActive: boolean
  featured: boolean
  employerId: null
  source: string
}

interface PostedJob {
  _id: string
  title: string
  company: string
  companyLogo: string
  location: string
  type: string
  category: string
  level: string
  description: string
  requirements: string[]
  benefits: string[]
  salary: string
  applicationUrl: string
  expiresAt: string
  isActive: boolean
  featured: boolean
  employerId: string | null
}

const categories = [
  "IT", "Marketing", "Dizajn", "Analitika", "Prodaja", "Proizvod",
  "Operacije", "Finansije", "HR", "Ostalo"
];

function AdminPage() {
  const router = useRouter();
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null)
  const [isCheckingDb, setIsCheckingDb] = useState(false)
  const [isScraping, setIsScraping] = useState(false)
  const [isScrapingDzobs, setIsScrapingDzobs] = useState(false)
  const [isScrapingMojposao, setIsScrapingMojposao] = useState(false)
  const [scrapedJobs, setScrapedJobs] = useState<ScrapedJob[]>([])
  const [isLoadingScrapedJobs, setIsLoadingScrapedJobs] = useState(false)
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [importingJobs, setImportingJobs] = useState<Set<string>>(new Set())
  const [rejectingJobs, setRejectingJobs] = useState<Set<string>>(new Set())
  const [postedJobs, setPostedJobs] = useState<PostedJob[]>([])
  const [isLoadingPostedJobs, setIsLoadingPostedJobs] = useState(false)
  const [deletingJobs, setDeletingJobs] = useState<Set<string>>(new Set())
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryJobId, setCategoryJobId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [authChecked, setAuthChecked] = useState(false);

  const handleCheckDatabase = async () => {
    setIsCheckingDb(true)
    setDbStatus(null)

    try {
      const response = await fetch("/api/database")
      const result: DatabaseStatus = await response.json()
      setDbStatus(result)
    } catch (error) {
      setDbStatus({
        success: false,
        message: "Failed to check database",
      })
    } finally {
      setIsCheckingDb(false)
    }
  }

  const handleScrapeJobs = async () => {
    setIsScraping(true)
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const result = await response.json()
      if (result.success) {
        await loadScrapedJobs()
      }
    } catch (error) {
      console.error("Scraping error:", error)
    } finally {
      setIsScraping(false)
    }
  }

  const handleScrapeDzobs = async () => {
    setIsScrapingDzobs(true)
    try {
      const response = await fetch("/api/scrape/dzobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const result = await response.json()
      if (result.success) {
        await loadScrapedJobs()
      }
    } catch (error) {
      console.error("Scraping dzobs error:", error)
    } finally {
      setIsScrapingDzobs(false)
    }
  }

  const handleScrapeMojposao = async () => {
    setIsScrapingMojposao(true)
    try {
      const response = await fetch("/api/scrape/mojposao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const result = await response.json()
      if (result.success) {
        await loadScrapedJobs()
      }
    } catch (error) {
      console.error("Scraping mojposao error:", error)
    } finally {
      setIsScrapingMojposao(false)
    }
  }

  const loadScrapedJobs = async () => {
    setIsLoadingScrapedJobs(true)
    try {
      const response = await fetch("/api/scraped-jobs")
      const result = await response.json()
      if (result.success) {
        setScrapedJobs(result.jobs)
      }
    } catch (error) {
      console.error("Error loading scraped jobs:", error)
    } finally {
      setIsLoadingScrapedJobs(false)
    }
  }

  const handleImportJob = async (jobId: string) => {
    setImportingJobs(prev => new Set(prev).add(jobId))
    try {
      const response = await fetch("/api/scraped-jobs/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      })
      const result = await response.json()
      if (result.success) {
        await loadScrapedJobs()
      }
    } catch (error) {
      console.error("Import error:", error)
    } finally {
      setImportingJobs(prev => {
        const newSet = new Set(prev)
        newSet.delete(jobId)
        return newSet
      })
    }
  }

  // Show dialog to select category before importing
  const handleImportWithCategory = (jobId: string) => {
    setCategoryJobId(jobId);
    setSelectedCategory(categories[0]);
    setCategoryDialogOpen(true);
  };

  const confirmImportWithCategory = async () => {
    if (!categoryJobId) return;
    setImportingJobs(prev => new Set(prev).add(categoryJobId));
    setCategoryDialogOpen(false);
    try {
      const response = await fetch("/api/scraped-jobs/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: categoryJobId, category: selectedCategory }),
      });
      const result = await response.json();
      if (result.success) {
        await loadScrapedJobs();
      }
    } catch (error) {
      console.error("Import error:", error);
    } finally {
      setImportingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(categoryJobId);
        return newSet;
      });
      setCategoryJobId(null);
    }
  };

  const handleRejectJob = async (jobId: string) => {
    setRejectingJobs(prev => new Set(prev).add(jobId))
    try {
      const response = await fetch("/api/scraped-jobs/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      })
      const result = await response.json()
      if (result.success) {
        await loadScrapedJobs()
      }
    } catch (error) {
      console.error("Reject error:", error)
    } finally {
      setRejectingJobs(prev => {
        const newSet = new Set(prev)
        newSet.delete(jobId)
        return newSet
      })
    }
  }

  // Fetch all posted jobs
  const loadPostedJobs = async () => {
    setIsLoadingPostedJobs(true)
    try {
      const response = await fetch("/api/jobs?limit=1000")
      const result = await response.json()
      if (result.success) {
        setPostedJobs(result.jobs)
      }
    } catch (error) {
      console.error("Error loading posted jobs:", error)
    } finally {
      setIsLoadingPostedJobs(false)
    }
  }

  // Delete a posted job
  const handleDeletePostedJob = async (jobId: string) => {
    setDeletingJobs(prev => new Set(prev).add(jobId))
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem("adminAuthToken") || localStorage.getItem("authToken")) : null;
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          "X-Admin-Delete": "true",
        },
      })
      const result = await response.json()
      if (result.success) {
        await loadPostedJobs()
      }
    } catch (error) {
      console.error("Delete job error:", error)
    } finally {
      setDeletingJobs(prev => {
        const newSet = new Set(prev)
        newSet.delete(jobId)
        return newSet
      })
    }
  }

  // Protect admin panel: require admin login
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("adminAuthToken");
      if (!token) {
        router.replace("/admin/login");
      } else {
        setAuthChecked(true);
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("adminAuthToken");
      router.replace("/admin/login");
    }
  };

  useEffect(() => {
    loadScrapedJobs()
    loadPostedJobs()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("bs-BA")
  }

  // Split scraped jobs by source using the new 'source' field
  const dzobsJobs = scrapedJobs.filter(job => job.source === 'dzobs');
  const mojposaoJobs = scrapedJobs.filter(job => job.source === 'mojposao');

  if (!authChecked) return null;

  return (
    <>
      <div className="min-h-screen bg-dark-primary pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 relative"
          >
            <h1 className="text-4xl font-bold text-white mb-4">Admin Panel</h1>
            <p className="text-gray-300">Manage your database and application settings</p>
            <Button onClick={handleLogout} className="absolute top-4 right-4 bg-red-500 text-white">Logout</Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Database Connection Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-dark-secondary border-dark-accent">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-brand-orange" />
                    Database Status
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Check your MongoDB connection and database statistics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleCheckDatabase}
                    disabled={isCheckingDb}
                    className="w-full bg-brand-orange hover:bg-brand-yellow text-white border-0"
                  >
                    {isCheckingDb ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2" />
                        Check Database
                      </>
                    )}
                  </Button>

                  {dbStatus && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {dbStatus.success ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className={dbStatus.success ? "text-green-400" : "text-red-400"}>{dbStatus.message}</span>
                      </div>

                      {dbStatus.success && dbStatus.stats && (
                        <div className="bg-dark-tertiary rounded-lg p-4 space-y-2">
                          <div className="text-sm text-gray-300">
                            <strong>Database:</strong> {dbStatus.database}
                          </div>
                          <div className="text-sm text-gray-300">
                            <strong>Collections:</strong> {dbStatus.stats.collections}
                          </div>
                          <div className="text-sm text-gray-300">
                            <strong>Documents:</strong> {dbStatus.stats.objects}
                          </div>
                          <div className="text-sm text-gray-300">
                            <strong>Data Size:</strong> {Math.round(dbStatus.stats.dataSize / 1024)} KB
                          </div>
                          {dbStatus.collections && dbStatus.collections.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {dbStatus.collections.map((collection) => (
                                <Badge key={collection} variant="outline" className="text-xs">
                                  {collection}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Scrape Jobs Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="bg-dark-secondary border-dark-accent">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Download className="w-5 h-5 text-brand-orange" />
                    Scrape Jobs
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Scrape jobs from external sources (mojposao.ba, dzobs.com)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleScrapeDzobs}
                      disabled={isScrapingDzobs}
                      className="w-full bg-brand-orange hover:bg-brand-yellow text-white border-0"
                    >
                      {isScrapingDzobs ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Scraping dzobs.com...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Scrape dzobs.com
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleScrapeMojposao}
                      disabled={isScrapingMojposao}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white border-0"
                    >
                      {isScrapingMojposao ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Scraping mojposao.ba...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Scrape mojposao.ba
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-sm text-gray-400">
                    <strong>Scraped Jobs:</strong> {scrapedJobs.length}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Scraped Jobs Management */}
          {(dzobsJobs.length > 0 || mojposaoJobs.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-8"
            >
              <Card className="bg-dark-secondary border-dark-accent">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-brand-orange" />
                    Scraped Jobs Management
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Review and import scraped jobs from external sources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* DZOBS JOBS SECTION */}
                    {dzobsJobs.length > 0 && (
                      <div>
                        <h2 className="text-lg font-bold text-brand-orange mb-2">Jobs scraped from dzobs.com</h2>
                        <div className="space-y-4">
                          {dzobsJobs.map((job) => (
                            <div key={job._id} className="bg-dark-tertiary rounded-lg p-4 border border-dark-accent">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="text-white font-semibold mb-1">{job.title}</h3>
                                  <div className="flex items-center gap-4 text-sm text-gray-300 mb-2">
                                    <span>{job.company}</span>
                                    <span>•</span>
                                    <span>{job.location}</span>
                                    <span>•</span>
                                    <span>Ističe: {formatDate(job.expiresAt)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {job.level}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {job.category}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {job.type}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setExpandedJob(expandedJob === job._id ? null : job._id)}
                                    className="border-dark-accent text-gray-300 hover:bg-dark-accent hover:text-brand-orange"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Preview
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleImportWithCategory(job._id)}
                                    disabled={importingJobs.has(job._id)}
                                    className="border-green-500/20 text-green-400 hover:bg-green-500/10"
                                  >
                                    {importingJobs.has(job._id) ? (
                                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                    )}
                                    Import
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRejectJob(job._id)}
                                    disabled={rejectingJobs.has(job._id)}
                                    className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                                  >
                                    {rejectingJobs.has(job._id) ? (
                                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    ) : (
                                      <X className="w-4 h-4 mr-1" />
                                    )}
                                    Reject
                                  </Button>
                                </div>
                              </div>
                              {expandedJob === job._id && (
                                <div className="mt-4 pt-4 border-t border-dark-accent">
                                  <div className="prose prose-invert max-w-none">
                                    <div className="text-sm text-gray-300 mb-3">
                                      <strong>Description:</strong>
                                      <div className="mt-2 text-gray-400" dangerouslySetInnerHTML={{ __html: job.description }} />
                                    </div>
                                    {job.requirements.length > 0 && (
                                      <div className="text-sm text-gray-300 mb-3">
                                        <strong>Requirements:</strong>
                                        <ul className="mt-2 text-gray-400 list-disc list-inside">
                                          {job.requirements.map((req, index) => (
                                            <li key={index}>{req}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {job.benefits.length > 0 && (
                                      <div className="text-sm text-gray-300 mb-3">
                                        <strong>Benefits:</strong>
                                        <ul className="mt-2 text-gray-400 list-disc list-inside">
                                          {job.benefits.map((benefit, index) => (
                                            <li key={index}>{benefit}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    <div className="text-sm text-gray-300">
                                      <strong>Salary:</strong> {job.salary}
                                    </div>
                                    <div className="text-sm text-gray-300">
                                      <strong>Application URL:</strong> {job.applicationUrl}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* MOJPOSAO JOBS SECTION */}
                    {mojposaoJobs.length > 0 && (
                      <div>
                        <h2 className="text-lg font-bold text-blue-400 mb-2">Jobs scraped from mojposao.ba</h2>
                        <div className="space-y-4">
                          {mojposaoJobs.map((job) => (
                            <div key={job._id} className="bg-dark-tertiary rounded-lg p-4 border border-dark-accent">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="text-white font-semibold mb-1">{job.title}</h3>
                                  <div className="flex items-center gap-4 text-sm text-gray-300 mb-2">
                                    <span>{job.company}</span>
                                    <span>•</span>
                                    <span>{job.location}</span>
                                    <span>•</span>
                                    <span>Ističe: {formatDate(job.expiresAt)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {job.level}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {job.category}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {job.type}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setExpandedJob(expandedJob === job._id ? null : job._id)}
                                    className="border-dark-accent text-gray-300 hover:bg-dark-accent hover:text-blue-400"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Preview
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleImportWithCategory(job._id)}
                                    disabled={importingJobs.has(job._id)}
                                    className="border-green-500/20 text-green-400 hover:bg-green-500/10"
                                  >
                                    {importingJobs.has(job._id) ? (
                                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                    )}
                                    Import
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRejectJob(job._id)}
                                    disabled={rejectingJobs.has(job._id)}
                                    className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                                  >
                                    {rejectingJobs.has(job._id) ? (
                                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    ) : (
                                      <X className="w-4 h-4 mr-1" />
                                    )}
                                    Reject
                                  </Button>
                                </div>
                              </div>
                              {expandedJob === job._id && (
                                <div className="mt-4 pt-4 border-t border-dark-accent">
                                  <div className="prose prose-invert max-w-none">
                                    <div className="text-sm text-gray-300 mb-3">
                                      <strong>Description:</strong>
                                      <div className="mt-2 text-gray-400" dangerouslySetInnerHTML={{ __html: job.description }} />
                                    </div>
                                    {job.requirements.length > 0 && (
                                      <div className="text-sm text-gray-300 mb-3">
                                        <strong>Requirements:</strong>
                                        <ul className="mt-2 text-gray-400 list-disc list-inside">
                                          {job.requirements.map((req, index) => (
                                            <li key={index}>{req}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {job.benefits.length > 0 && (
                                      <div className="text-sm text-gray-300 mb-3">
                                        <strong>Benefits:</strong>
                                        <ul className="mt-2 text-gray-400 list-disc list-inside">
                                          {job.benefits.map((benefit, index) => (
                                            <li key={index}>{benefit}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    <div className="text-sm text-gray-300">
                                      <strong>Salary:</strong> {job.salary}
                                    </div>
                                    <div className="text-sm text-gray-300">
                                      <strong>Application URL:</strong> {job.applicationUrl}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Posted Jobs Management */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8"
          >
            <Card className="bg-dark-secondary border-dark-accent">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-brand-orange" />
                  Posted Jobs Management
                </CardTitle>
                <CardDescription className="text-gray-300">
                  View and delete jobs that are already posted
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingPostedJobs ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
                      <span className="ml-2 text-gray-300">Loading posted jobs...</span>
                    </div>
                  ) : (
                    postedJobs.map((job) => (
                      <div key={job._id} className="bg-dark-tertiary rounded-lg p-4 border border-dark-accent flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{job.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-300 mb-2">
                            <span>{job.company}</span>
                            <span>•</span>
                            <span>{job.location}</span>
                            <span>•</span>
                            <span>Ističe: {formatDate(job.expiresAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {job.level}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {job.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {job.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePostedJob(job._id)}
                            disabled={deletingJobs.has(job._id)}
                            className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                          >
                            {deletingJobs.has(job._id) ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-1" />
                            )}
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-8"
          >
            <Card className="bg-dark-secondary border-dark-accent">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
                <CardDescription className="text-gray-300">Common administrative tasks and navigation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="border-dark-accent text-gray-300 hover:bg-dark-tertiary hover:text-brand-orange bg-transparent"
                    asChild
                  >
                    <a href="/jobs">View Jobs Page</a>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-dark-accent text-gray-300 hover:bg-dark-tertiary hover:text-brand-orange bg-transparent"
                    asChild
                  >
                    <a href="/employer/register">Employer Registration</a>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-dark-accent text-gray-300 hover:bg-dark-tertiary hover:text-brand-orange bg-transparent"
                    asChild
                  >
                    <a href="/">Home Page</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sample Login Credentials */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-6 mb-8"
          >
            <Card className="bg-dark-secondary border-dark-accent">
              <CardHeader>
                <CardTitle className="text-white">Sample Login Credentials</CardTitle>
                <CardDescription className="text-gray-300">
                  Use these credentials to test employer login after seeding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-dark-tertiary rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">TechStart d.o.o.</h4>
                    <p className="text-sm text-gray-300">Email: hr@techstart.ba</p>
                    <p className="text-sm text-gray-300">Password: password123</p>
                  </div>
                  <div className="bg-dark-tertiary rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Growth Co.</h4>
                    <p className="text-sm text-gray-300">Email: jobs@growthco.ba</p>
                    <p className="text-sm text-gray-300">Password: password123</p>
                  </div>
                  <div className="bg-dark-tertiary rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">DataFlow Systems</h4>
                    <p className="text-sm text-gray-300">Email: careers@dataflow.ba</p>
                    <p className="text-sm text-gray-300">Password: password123</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      {/* Category selection dialog for import */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Odaberite kategoriju za posao</DialogTitle>
          </DialogHeader>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Odaberite kategoriju" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={confirmImportWithCategory} className="bg-brand-orange text-white w-full mt-4">Importuj posao</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </>
  )
}

// This is the key fix - make sure we have a proper default export
export default AdminPage
