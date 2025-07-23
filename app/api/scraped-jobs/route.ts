import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDatabase()
    const collection = db.collection("ScrapedJobs")
    const jobs = await collection.find({}).toArray()
    
    return NextResponse.json({
      success: true,
      jobs
    })
  } catch (error) {
    console.error("Error fetching scraped jobs:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to fetch scraped jobs",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 