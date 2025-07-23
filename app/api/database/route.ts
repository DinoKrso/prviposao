import { NextResponse } from "next/server"
import { getDatabase, testConnection } from "@/lib/mongodb"

export async function GET() {
  try {
    // First test the connection
    const isConnected = await testConnection()

    if (!isConnected) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed",
          error: "Unable to connect to MongoDB",
        },
        { status: 500 },
      )
    }

    const db = await getDatabase()

    // Test the connection by getting database stats
    const stats = await db.stats()

    // Test collections
    const collections = await db.listCollections().toArray()

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      database: stats.db,
      collections: collections.map((col) => col.name),
      stats: {
        collections: stats.collections || 0,
        objects: stats.objects || 0,
        dataSize: stats.dataSize || 0,
      },
      connectionString: process.env.MONGODB_URI ? "Connected" : "Using default localhost",
    })
  } catch (error) {
    console.error("Database connection error:", error)

    // More detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : "No stack trace"

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: errorMessage,
        details: errorStack,
        mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/",
      },
      { status: 500 },
    )
  }
}
