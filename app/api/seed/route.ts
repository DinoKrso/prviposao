import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Job } from "@/lib/models/Job"
import type { User } from "@/lib/models/User"
import { hashPassword } from "@/lib/auth"

export async function POST() {
  try {
    const db = await getDatabase()

    // Clear existing data
    await db.collection("jobs").deleteMany({})
    await db.collection("users").deleteMany({})

    // Create sample employers
    const employers = [
      {
        email: "hr@techstart.ba",
        password: await hashPassword("password123"),
        role: "employer" as const,
        profile: {
          name: "Marko Marković",
          company: "TechStart d.o.o.",
          companySize: "11-50 zaposlenih",
          industry: "Tehnologija",
          website: "https://techstart.ba",
          description: "Inovativna IT kompanija fokusirana na web development",
          contactName: "Marko Marković",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "jobs@growthco.ba",
        password: await hashPassword("password123"),
        role: "employer" as const,
        profile: {
          name: "Ana Anić",
          company: "Growth Co.",
          companySize: "51-200 zaposlenih",
          industry: "Marketing",
          website: "https://growthco.ba",
          description: "Digitalna marketing agencija",
          contactName: "Ana Anić",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "careers@dataflow.ba",
        password: await hashPassword("password123"),
        role: "employer" as const,
        profile: {
          name: "Petar Petrović",
          company: "DataFlow Systems",
          companySize: "201-500 zaposlenih",
          industry: "Analitika",
          website: "https://dataflow.ba",
          description: "Kompanija specijalizovana za analizu podataka",
          contactName: "Petar Petrović",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const employerResults = await db.collection<User>("users").insertMany(employers)
    const employerIds = Object.values(employerResults.insertedIds)

    // Create sample jobs with expiration dates
    const jobs: Omit<Job, "_id">[] = [
      {
        title: "Junior Frontend Developer",
        company: "TechStart d.o.o.",
        companyLogo: "/placeholder.svg?height=60&width=60&text=TS",
        location: "Sarajevo, BiH",
        type: "Puno radno vrijeme",
        category: "IT",
        level: "Junior",
        description: `
          <h3>O poziciji</h3>
          <p>Pridružite se našem dinamičnom timu kao junior frontend developer. Radićete na razvoju modernih web aplikacija koristeći najnovije tehnologije.</p>
          
          <h3>Odgovornosti</h3>
          <ul>
            <li>Razvoj korisničkih interfejsa koristeći React i TypeScript</li>
            <li>Saradnja sa UX/UI dizajnerima na implementaciji dizajna</li>
            <li>Optimizacija performansi web aplikacija</li>
            <li>Pisanje čistog, održivog koda</li>
            <li>Učešće u code review procesima</li>
          </ul>
          
          <h3>Zahtjevi</h3>
          <ul>
            <li>Osnovno znanje HTML, CSS, JavaScript</li>
            <li>Poznavanje React biblioteke</li>
            <li>Razumijevanje Git version control sistema</li>
            <li>Dobro poznavanje engleskog jezika</li>
            <li>Želja za učenjem i napredovanjem</li>
          </ul>
        `,
        requirements: ["React", "TypeScript", "HTML/CSS", "Git", "JavaScript"],
        benefits: ["Fleksibilno radno vrijeme", "Rad od kuće", "Obuke i certifikati", "Zdravstveno osiguranje"],
        salary: "1.500 - 2.000 KM",
        applicationUrl: "mailto:hr@techstart.ba",
        employerId: employerIds[0],
        isActive: true,
        featured: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Marketing Praktikant",
        company: "Growth Co.",
        companyLogo: "/placeholder.svg?height=60&width=60&text=GC",
        location: "Udaljeno",
        type: "Praksa",
        category: "Marketing",
        level: "Praksa",
        description: `
          <h3>O poziciji</h3>
          <p>Odličnu priliku za studente i mlade profesionalce da steknu praktično iskustvo u digitalnom marketingu.</p>
          
          <h3>Šta ćete raditi</h3>
          <ul>
            <li>Kreiranje sadržaja za društvene mreže</li>
            <li>Analiza marketing kampanja</li>
            <li>Email marketing</li>
            <li>SEO optimizacija</li>
            <li>Market research</li>
          </ul>
          
          <h3>Tražimo</h3>
          <ul>
            <li>Student marketinga ili srodne oblasti</li>
            <li>Kreativnost i inovativnost</li>
            <li>Poznavanje društvenih mreža</li>
            <li>Analitičko razmišljanje</li>
          </ul>
        `,
        requirements: ["Kreativnost", "Social Media", "Analitika", "Komunikacija"],
        benefits: ["Mentorstvo", "Fleksibilni sati", "Mogućnost zaposlenja", "Sertifikati"],
        salary: "500 KM/mjesečno",
        applicationUrl: "mailto:jobs@growthco.ba",
        employerId: employerIds[1],
        isActive: true,
        featured: false,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Junior Data Analitičar",
        company: "DataFlow Systems",
        companyLogo: "/placeholder.svg?height=60&width=60&text=DF",
        location: "Banja Luka, BiH",
        type: "Puno radno vrijeme",
        category: "Analitika",
        level: "Junior",
        description: `
          <h3>Opis posla</h3>
          <p>Tražimo motiviranog junior data analitičara koji će se pridružiti našem timu i raditi na analizi podataka za donošenje poslovnih odluka.</p>
          
          <h3>Glavne aktivnosti</h3>
          <ul>
            <li>Analiza velikih skupova podataka</li>
            <li>Kreiranje izvještaja i dashboard-a</li>
            <li>Rad sa SQL bazama podataka</li>
            <li>Vizualizacija podataka</li>
            <li>Saradnja sa različitim timovima</li>
          </ul>
          
          <h3>Potrebne vještine</h3>
          <ul>
            <li>Osnovno znanje SQL-a</li>
            <li>Excel na naprednom nivou</li>
            <li>Poznavanje Python-a (poželjno)</li>
            <li>Analitičko razmišljanje</li>
            <li>Pažnja na detalje</li>
          </ul>
        `,
        requirements: ["SQL", "Excel", "Python", "Analitika", "Power BI"],
        benefits: ["Obuke", "Napredovanje", "Tim building", "Bonusi"],
        salary: "1.300 - 1.600 KM",
        applicationUrl: "mailto:careers@dataflow.ba",
        employerId: employerIds[2],
        isActive: true,
        featured: false,
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Add an expired job for testing
      {
        title: "Junior UX Designer",
        company: "TechStart d.o.o.",
        companyLogo: "/placeholder.svg?height=60&width=60&text=TS",
        location: "Sarajevo, BiH",
        type: "Puno radno vrijeme",
        category: "Dizajn",
        level: "Junior",
        description: "Expired job for testing purposes.",
        requirements: ["Figma", "Adobe XD", "UX/UI", "Prototyping"],
        benefits: ["Kreativno okruženje", "Fleksibilnost"],
        salary: "1.400 - 1.800 KM",
        applicationUrl: "mailto:hr@techstart.ba",
        employerId: employerIds[0],
        isActive: true,
        featured: false,
        expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (expired)
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ]

    await db.collection<Job>("jobs").insertMany(jobs)

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      data: {
        employers: employers.length,
        jobs: jobs.length,
      },
    })
  } catch (error) {
    console.error("Seeding error:", error)
    return NextResponse.json({ success: false, message: "Failed to seed database" }, { status: 500 })
  }
}
