import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    mongoUri: process.env.MONGODB_URI || "Not set",
    jwtSecret: process.env.JWT_SECRET ? "Set" : "Not set",
    availableEnvVars: Object.keys(process.env).filter((key) => key.includes("MONGO") || key.includes("JWT")),
  })
}
