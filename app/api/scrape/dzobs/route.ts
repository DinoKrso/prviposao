import { NextResponse } from "next/server"
import { scrapeDzobs, saveScrapedJobs } from "@/lib/scrape-jobs"

export async function POST() {
  try {
    const jobs = await scrapeDzobs()
    await saveScrapedJobs(jobs)
    return NextResponse.json({
      success: true,
      message: `Scraped ${jobs.length} jobs from dzobs.com`
    })
  } catch (error) {
    console.error("Scraping dzobs.com error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to scrape dzobs.com",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 