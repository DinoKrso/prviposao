import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json()
    
    if (!jobId) {
      return NextResponse.json({
        success: false,
        message: "Job ID is required"
      }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection("ScrapedJobs")

    // Convert string ID to ObjectId
    const objectId = new ObjectId(jobId)

    // Delete the scraped job
    const result = await collection.deleteOne({ _id: objectId })

    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        message: "Scraped job not found"
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Job rejected and deleted successfully"
    })
  } catch (error) {
    console.error("Reject error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to reject job",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 