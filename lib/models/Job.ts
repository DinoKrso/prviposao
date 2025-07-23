import type { ObjectId } from "mongodb"

export interface Job {
  _id?: ObjectId
  title: string
  company: string
  companyLogo?: string
  location: string
  type: "Puno radno vrijeme" | "Skraćeno radno vrijeme" | "Praksa"
  category: string
  level: "Junior" | "Praksa"
  description: string
  requirements: string[]
  benefits: string[]
  salary: string
  applicationUrl: string
  employerId: ObjectId
  isActive: boolean
  featured: boolean
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}
