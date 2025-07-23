import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Job } from "@/lib/models/Job"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const { jobId, category } = await request.json()
    
    if (!jobId) {
      return NextResponse.json({
        success: false,
        message: "Job ID is required"
      }, { status: 400 })
    }

    const db = await getDatabase()
    const scrapedCollection = db.collection("ScrapedJobs")
    const jobsCollection = db.collection<Job>("jobs")

    // Convert string ID to ObjectId
    const objectId = new ObjectId(jobId)

    // Find the scraped job
    const scrapedJob = await scrapedCollection.findOne({ _id: objectId })
    
    if (!scrapedJob) {
      return NextResponse.json({
        success: false,
        message: "Scraped job not found"
      }, { status: 404 })
    }

    // Check for duplicates: same title and company
    const duplicate = await jobsCollection.findOne({ title: scrapedJob.title, company: scrapedJob.company });
    if (duplicate) {
      return NextResponse.json({
        success: false,
        message: "Duplicate job already exists in the database"
      }, { status: 409 });
    }

    // Convert to Job schema and import
    let createdAt = new Date();
    let expiresAt = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (scrapedJob.source !== 'mojposao') {
      // Use scraped dates for non-mojposao jobs
      createdAt = new Date(scrapedJob.createdAt || Date.now());
      expiresAt = new Date(scrapedJob.expiresAt || (createdAt.getTime() + 30 * 24 * 60 * 60 * 1000));
    }
    const jobToImport: Omit<Job, "_id"> = {
      title: scrapedJob.title,
      company: scrapedJob.company,
      companyLogo: scrapedJob.companyLogo,
      location: scrapedJob.location,
      type: scrapedJob.type as "Puno radno vrijeme" | "Skraćeno radno vrijeme" | "Praksa",
      category: category || scrapedJob.category || "IT",
      level: scrapedJob.level as "Junior" | "Praksa",
      description: scrapedJob.description,
      requirements: scrapedJob.requirements,
      benefits: scrapedJob.benefits,
      salary: scrapedJob.salary,
      applicationUrl: scrapedJob.applicationUrl,
      employerId: null as any, // Will be set to a default employer or null
      isActive: true,
      featured: false,
      expiresAt,
      createdAt,
      updatedAt: createdAt
    }

    // Insert into jobs collection
    const result = await jobsCollection.insertOne(jobToImport)

    // Delete from scraped jobs
    await scrapedCollection.deleteOne({ _id: objectId })

    return NextResponse.json({
      success: true,
      message: "Job imported successfully",
      jobId: result.insertedId
    })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to import job",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 