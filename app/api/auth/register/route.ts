import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { hashPassword, generateToken } from "@/lib/auth"
import type { User } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Registration request body:", body)

    const {
      email,
      password,
      confirmPassword,
      role = "employer",
      companyName,
      contactName,
      companySize,
      industry,
      website,
      description,
    } = body

    // Validation
    if (!email || !password || !contactName) {
      return NextResponse.json(
        { success: false, message: "Email, password, and contact name are required" },
        { status: 400 },
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, message: "Passwords do not match" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long" },
        { status: 400 },
      )
    }

    console.log("Attempting to connect to database...")
    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    console.log("Checking for existing user...")
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ success: false, message: "User with this email already exists" }, { status: 400 })
    }

    console.log("Hashing password...")
    // Hash password
    const hashedPassword = await hashPassword(password)

    console.log("Creating new user...")
    // Create user
    const newUser: Omit<User, "_id"> = {
      email,
      password: hashedPassword,
      role: role as "employer" | "jobseeker",
      profile: {
        name: contactName,
        company: companyName,
        companySize,
        industry,
        website,
        description,
        contactName,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)
    console.log("User created with ID:", result.insertedId)

    // Generate JWT token
    const token = generateToken(result.insertedId.toString(), email, role)

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: result.insertedId,
        email,
        role,
        profile: newUser.profile,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
