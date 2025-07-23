import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Job } from "@/lib/models/Job"
import { ObjectId } from "mongodb"
import { verifyToken } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Allow admin panel to delete any job if X-Admin-Delete header is set or if user is admin
    const isAdminDelete = request.headers.get("x-admin-delete") === "true";
    const isAdminUser = decoded.role === 'admin';

    const jobId = params.id

    // Validate ObjectId
    if (!ObjectId.isValid(jobId)) {
      return NextResponse.json({ success: false, message: "Invalid job ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const jobsCollection = db.collection<Job>("jobs")

    // Find the job first to verify ownership
    const job = await jobsCollection.findOne({ _id: new ObjectId(jobId) })

    if (!job) {
      return NextResponse.json({ success: false, message: "Job not found" }, { status: 404 })
    }

    if (!isAdminDelete && !isAdminUser) {
      // Verify the employer owns this job
      if (job.employerId && job.employerId.toString() !== decoded.userId) {
        return NextResponse.json({ success: false, message: "Unauthorized to delete this job" }, { status: 403 })
      }
      if (!job.employerId) {
        return NextResponse.json({ success: false, message: "Unauthorized to delete this job" }, { status: 403 })
      }
    }

    // Delete the job
    const result = await jobsCollection.deleteOne({ _id: new ObjectId(jobId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Failed to delete job" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Job deleted successfully",
    })
  } catch (error) {
    console.error("Job deletion error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete job",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const jobId = params.id
    const body = await request.json()

    // Validate ObjectId
    if (!ObjectId.isValid(jobId)) {
      return NextResponse.json({ success: false, message: "Invalid job ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const jobsCollection = db.collection<Job>("jobs")

    // Find the job first to verify ownership
    const job = await jobsCollection.findOne({ _id: new ObjectId(jobId) })

    if (!job) {
      return NextResponse.json({ success: false, message: "Job not found" }, { status: 404 })
    }

    // Verify the employer owns this job
    if (job.employerId.toString() !== decoded.userId) {
      return NextResponse.json({ success: false, message: "Unauthorized to update this job" }, { status: 403 })
    }

    // Update the job
    const updateData = {
      ...body,
      updatedAt: new Date(),
    }

    const result = await jobsCollection.updateOne({ _id: new ObjectId(jobId) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Job updated successfully",
    })
  } catch (error) {
    console.error("Job update error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update job",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
