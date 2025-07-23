import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Job } from "@/lib/models/Job"
import { ObjectId } from "mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const type = searchParams.get("type")
    const location = searchParams.get("location")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const db = await getDatabase()
    const jobsCollection = db.collection<Job>("jobs")

    // Build query - only show active jobs that haven't expired
    const query: any = {
      isActive: true,
      expiresAt: { $gt: new Date() }, // Only show jobs that haven't expired
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    if (category && category !== "Sve") {
      query.category = category
    }

    if (type && type !== "Sve") {
      query.type = type
    }

    if (location && location !== "Sve") {
      query.location = location
    }

    // Get jobs with pagination
    const jobsRaw = await jobsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    const jobs = jobsRaw.map(job => ({
      ...job,
      createdAt: job.createdAt instanceof Date ? job.createdAt.toISOString() : job.createdAt,
      updatedAt: job.updatedAt instanceof Date ? job.updatedAt.toISOString() : job.updatedAt,
      expiresAt: job.expiresAt instanceof Date ? job.expiresAt.toISOString() : job.expiresAt,
    }));

    // Get total count
    const total = await jobsCollection.countDocuments(query)

    return NextResponse.json({
      success: true,
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Jobs fetch error:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch jobs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      title,
      company,
      location,
      type,
      category,
      level,
      description,
      requirements,
      benefits,
      salary,
      applicationUrl,
      employerId,
      expirationDays,
    } = body

    // Validation
    if (!title || !company || !location || !type || !category || !description || !employerId) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Verify the employer ID matches the authenticated user
    if (decoded.userId !== employerId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (Number.parseInt(expirationDays) || 30))

    const db = await getDatabase()
    const jobsCollection = db.collection<Job>("jobs")

    const newJob: Omit<Job, "_id"> = {
      title,
      company,
      companyLogo: `/placeholder.svg?height=60&width=60&text=${company.substring(0, 2).toUpperCase()}`,
      location,
      type,
      category,
      level: level || "Junior",
      description,
      requirements: requirements || [],
      benefits: benefits || [],
      salary: salary || "Dogovorljivo",
      applicationUrl: applicationUrl || `mailto:${decoded.email}`,
      employerId: new ObjectId(employerId),
      isActive: true,
      featured: false,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await jobsCollection.insertOne(newJob)

    return NextResponse.json({
      success: true,
      message: "Job created successfully",
      jobId: result.insertedId,
    })
  } catch (error) {
    console.error("Job creation error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create job",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
