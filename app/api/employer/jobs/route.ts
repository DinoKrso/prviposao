import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Job } from "@/lib/models/Job"
import { ObjectId } from "mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const db = await getDatabase()
    const jobsCollection = db.collection<Job>("jobs")

    // Get all jobs for this employer (including expired ones for dashboard)
    const jobs = await jobsCollection
      .find({ employerId: new ObjectId(decoded.userId) })
      .sort({ createdAt: -1 })
      .toArray()

    // Calculate stats
    const now = new Date()
    const activeJobs = jobs.filter((job) => job.isActive && job.expiresAt > now).length
    const expiredJobs = jobs.filter((job) => job.expiresAt <= now).length
    const totalViews = 0 // This would come from analytics if implemented
    const totalApplications = 0 // This would come from application tracking if implemented

    return NextResponse.json({
      success: true,
      jobs,
      stats: {
        activeJobs,
        expiredJobs,
        totalViews,
        totalApplications,
        totalJobs: jobs.length,
      },
    })
  } catch (error) {
    console.error("Employer jobs fetch error:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch jobs" }, { status: 500 })
  }
}
