import { NextResponse } from "next/server"
import { runAllScrapers } from "@/lib/scrape-jobs"

export async function POST() {
  try {
    await runAllScrapers()
    return NextResponse.json({
      success: true,
      message: "Job scraping completed successfully"
    })
  } catch (error) {
    console.error("Scraping error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to scrape jobs",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 