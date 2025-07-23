import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  password: string
  role: "jobseeker" | "employer"
  profile: {
    name: string
    company?: string
    companySize?: string
    industry?: string
    website?: string
    description?: string
    contactName?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface JobSeeker extends User {
  role: "jobseeker"
  profile: {
    name: string
    skills?: string[]
    experience?: string
    education?: string
    location?: string
    resume?: string
  }
}

export interface Employer extends User {
  role: "employer"
  profile: {
    name: string
    company: string
    companySize?: string
    industry?: string
    website?: string
    description?: string
    contactName: string
  }
}
