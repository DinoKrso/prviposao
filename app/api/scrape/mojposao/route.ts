import { NextResponse } from "next/server"
import { saveScrapedJobs } from "@/lib/scrape-jobs"
import { scrapeMojPosaoPuppeteer } from "@/lib/scrape-mojposao-puppeteer"

export async function POST() {
  try {
    const jobs = await scrapeMojPosaoPuppeteer()
    await saveScrapedJobs(jobs)
    return NextResponse.json({
      success: true,
      message: `Scraped ${jobs.length} jobs from mojposao.ba`
    })
  } catch (error) {
    console.error("Scraping mojposao.ba error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to scrape mojposao.ba",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 