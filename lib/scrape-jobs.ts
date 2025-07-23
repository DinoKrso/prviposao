import axios from "axios"
import * as cheerio from "cheerio"
import type { Cheerio } from "cheerio"
import { getDatabase } from "./mongodb"
import fs from "fs";

export interface ScrapedJob {
  title: string
  company: string
  companyLogo: string
  location: string
  type: string
  category: string
  level: string
  description: string
  requirements: string[]
  benefits: string[]
  salary: string
  applicationUrl: string
  expiresAt: Date
  isActive: boolean
  featured: boolean
  employerId: null
  source: string
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function parseExpiresAt(text: string): Date {
  // Examples: "ističe 25.07.2025", "još 3 dana"
  const now = new Date()
  const matchDate = text.match(/(\d{2})\.(\d{2})\.(\d{4})/)
  if (matchDate) {
    const [_, d, m, y] = matchDate
    return new Date(`${y}-${m}-${d}T23:59:59`)
  }
  const matchDays = text.match(/još (\d+) dana?/) // "još 3 dana"
  if (matchDays) {
    const days = parseInt(matchDays[1], 10)
    now.setDate(now.getDate() + days)
    return now
  }
  return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // fallback: 7 days
}

export async function scrapeMojPosao() {
  const jobs: ScrapedJob[] = [];
  try {
    const response = await axios.get("https://www.mojposao.ba/poslovi?keyword=junior&page=1", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    const $ = cheerio.load(response.data);

    // Get existing jobs to prevent duplicates
    const db = await getDatabase();
    const existingJobs = await db.collection("ScrapedJobs").find({}).toArray();
    const existingTitles = new Set(existingJobs.map(job => job.title));
    const existingCompanies = new Set(existingJobs.map(job => job.company));
    // Also get jobs from the main jobs collection to prevent re-scraping imported jobs
    const importedJobs = await db.collection("jobs").find({}, { projection: { title: 1, company: 1 } }).toArray();
    const importedJobKeys = new Set(importedJobs.map(job => `${job.title}|||${job.company}`));

    // DEBUG: Save the HTML of the listing page for inspection
    const fs = require('fs');
    fs.writeFileSync('debug-mojposao-listing.html', response.data);

    // For mojposao.ba: Find all job title links inside <div class="EV5KEN-pg-w">
    const mojposaoJobLinks = $("div.EV5KEN-pg-w a.gwt-Anchor.gwt-HyperAnchor");
    mojposaoJobLinks.each((i, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr('href');
      console.log(`[mojposao] Link ${i + 1}: text="${text}" href="${href}"`);
    });
    const juniorJobLinks = mojposaoJobLinks.filter((_, el) => $(el).text().toLowerCase().includes('junior'));
    console.log(`[mojposao] Found ${juniorJobLinks.length} junior job links on listing page.`);
    for (let i = 0; i < juniorJobLinks.length; i++) {
      const jobLink = juniorJobLinks[i];
      const $jobLink = $(jobLink);
      const href = $jobLink.attr("href");
      const jobTitle = $jobLink.text().trim();
      if (!href || !jobTitle) continue;
      // Get company from the listing if possible (not always available)
      // We'll get it from the detail page
      // Check for duplicates
      const jobKey = `${jobTitle}|||`;
      if ((existingTitles.has(jobTitle) && existingCompanies.has('')) || importedJobKeys.has(jobKey)) {
        console.log(`[mojposao] Skipping duplicate job: ${jobTitle}`);
        continue;
      }
      // Fetch job detail page
      const fullJobUrl = href.startsWith("http") ? href : `https://www.mojposao.ba${href}`;
      console.log(`[mojposao] Processing job ${i + 1}/${juniorJobLinks.length}: ${jobTitle} (${fullJobUrl})`);
      try {
        const detailResponse = await axios.get(fullJobUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          }
        });
        const $detail = cheerio.load(detailResponse.data);
        // Company logo
        let companyLogo = $detail('img.EV5KEN-i-w').attr('src') || '';
        if (companyLogo && companyLogo.startsWith('//')) companyLogo = 'https:' + companyLogo;
        // Company name
        const company = $detail('div.EV5KEN-i-l').first().text().trim();
        // Job title
        const title = $detail('h1.EV5KEN-i-f.EV5KEN-i-l').text().trim() || jobTitle;
        // Job details
        const detailsDiv = $detail('div.EV5KEN-i-q');
        let location = '';
        let description = '';
        if (detailsDiv.length) {
          // The first <font> contains location
          const firstFont = detailsDiv.find('font').first();
          const locText = firstFont.text().trim();
          if (locText.toLowerCase().startsWith('lokacija:')) {
            location = locText.replace(/^Lokacija:/i, '').split(',')[0].trim();
          }
          // Remove the location line from the description
          firstFont.remove();
          description = detailsDiv.text().trim();
        }
        // Set type based on location string
        let type: string = 'Puno radno vrijeme';
        if (/puno radno vrijeme/i.test(detailsDiv.text())) type = 'Puno radno vrijeme';
        else if (/skraćeno radno vrijeme/i.test(detailsDiv.text())) type = 'Skraćeno radno vrijeme';
        else if (/praksa/i.test(detailsDiv.text())) type = 'Praksa';
        // Requirements and benefits: try to extract from description (not always structured)
        let requirements: string[] = [];
        let benefits: string[] = [];
        // Try to extract <b>Potrebne kvalifikacije:</b> and <b>Šta nudimo:</b> sections
        const reqSection = detailsDiv.find('b:contains("Potrebne kvalifikacije")').parent().next('ul');
        if (reqSection.length) {
          requirements = reqSection.find('li').map((_, el) => $detail(el).text().trim()).get();
        }
        const benSection = detailsDiv.find('b:contains("Šta nudimo")').parent().next('ul');
        if (benSection.length) {
          benefits = benSection.find('li').map((_, el) => $detail(el).text().trim()).get();
        }
        // Salary: not always available
        let salary = 'Dogovorljivo';
        // Application URL: fallback to job page
        const applicationUrl = fullJobUrl;
        // Compose job object
        if (title && company) {
          console.log(`[mojposao] Pushing job: ${title} at ${company}`);
          jobs.push({
            title,
            company,
            companyLogo: companyLogo || `/placeholder.svg?height=60&width=60&text=${getInitials(company)}`,
            location: location || 'Nepoznato',
            type,
            category: 'IT',
            level: 'Junior',
            description,
            requirements,
            benefits,
            salary,
            applicationUrl,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            isActive: true,
            featured: false,
            employerId: null,
            source: 'mojposao',
          });
        }
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error fetching job details from ${fullJobUrl}:`, error instanceof Error ? error.message : String(error));
        continue;
      }
    }
    console.log(`[mojposao] Total jobs pushed: ${jobs.length}`);
  } catch (error) {
    console.error("Error scraping mojposao.ba:", error);
  }
  return jobs;
}

export async function scrapeDzobs() {
  const jobs: ScrapedJob[] = [];
  try {
    console.log("Starting to scrape dzobs.com Junior jobs...");

    // Use the specific URL for Junior jobs
    const juniorJobsUrl = "https://www.dzobs.com/iskustvo/junior/1";

    const response = await axios.get(juniorJobsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    console.log(`Successfully loaded Junior jobs page: ${juniorJobsUrl}`);

    // Find all job links (a tags with class 'standard')
    const jobLinks = $("a.standard");
    console.log(`Found ${jobLinks.length} job links`);

    // Get existing jobs to prevent duplicates
    const db = await getDatabase();
    const existingJobs = await db.collection("ScrapedJobs").find({}).toArray();
    const existingTitles = new Set(existingJobs.map(job => job.title));
    const existingCompanies = new Set(existingJobs.map(job => job.company));
    // Also get jobs from the main jobs collection to prevent re-scraping imported jobs
    const importedJobs = await db.collection("jobs").find({}, { projection: { title: 1, company: 1 } }).toArray();
    const importedJobKeys = new Set(importedJobs.map(job => `${job.title}|||${job.company}`));

    // DEBUG: Save the HTML of the listing page for inspection
    const fs = require('fs');
    fs.writeFileSync('debug-mojposao-listing.html', response.data);

    // Only process all <a.standard> links for dzobs.com
    for (let i = 0; i < jobLinks.length; i++) {
      const jobLink = jobLinks[i];
      const $jobLink = $(jobLink);
      const href = $jobLink.attr("href");

      if (!href) {
        console.log(`No href found for job link ${i + 1}`);
        continue;
      }

      // Get job title from the h3 element inside the link
      const jobTitle = $jobLink.find("h3.font-medium").text().trim();
      const company = $jobLink.find(".text-gray-dark.font-light").text().trim();

      // Check for duplicates
      const jobKey = `${jobTitle}|||${company}`;
      if ((existingTitles.has(jobTitle) && existingCompanies.has(company)) || importedJobKeys.has(jobKey)) {
        console.log(`Skipping duplicate job: ${jobTitle} at ${company}`);
        continue;
      }

      console.log(`Processing job ${i + 1}/${jobLinks.length}: ${jobTitle}`);

      // Make sure it's a full URL
      const fullJobUrl = href.startsWith("http") ? href : `https://www.dzobs.com${href}`;
      console.log(`Clicking on job: ${fullJobUrl}`);

      try {
        // "Click" on the job by fetching the detailed job page
        const jobResponse = await axios.get(fullJobUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive"
          },
          timeout: 10000
        });

        // DEBUG: Save the HTML to a file for inspection
        fs.writeFileSync(`debug-job-${i + 1}.html`, jobResponse.data);

        const $jobPage = cheerio.load(jobResponse.data);

        // --- NEW SELECTORS BASED ON ACTUAL JOB PAGE STRUCTURE ---
        // Company name (h2)
        const companyName = $jobPage('h2').first().text().trim();

        // Position (title, h1)
        const positionTitle = $jobPage('h1').first().text().trim();

        // Remote/Onsite and Location (text after h1, split by '|')
        let remoteOrOnsite = '';
        let jobLocation = '';
        const metaText = $jobPage('h1').first().next().text().trim();
        if (metaText && metaText.includes('|')) {
          [remoteOrOnsite, jobLocation] = metaText.split('|').map(s => s.trim());
        } else if (metaText) {
          // If only one value, treat as location if it doesn't match 'Remote' or 'Onsite'
          if (/remote|onsite/i.test(metaText)) {
            remoteOrOnsite = metaText.trim();
          } else {
            jobLocation = metaText.trim();
          }
        }
        // If remoteOrOnsite is missing, set type to default and use jobLocation for location
        const typeFinal = remoteOrOnsite || 'Puno radno vrijeme';
        const locationFinal = jobLocation || 'Nepoznato';

        // Fallbacks if selectors fail
        const title = positionTitle || jobTitle;
        const companyFinal = companyName || company;
        // (handled above)

        // Salary, description, and other fields remain as before
        const salary = $jobPage(".salary, .plata, .compensation, [class*='salary']").first().text().trim() || "Fleksibilno";

        // New robust section extraction: get all <span data-text="true"> in each <section> by heading, join with spaces
        function extractSectionTextByHeading($container: Cheerio<any>, heading: string): string {
          // Find the section by heading text
          const section = $container.find('section').filter((i: number, el: any) => {
            return $jobPage(el).find('h3').first().text().trim() === heading;
          }).first();
          if (!section.length) return '';
          // Get all descendant <span data-text="true">
          const lines = section.find('span[data-text="true"]').map((_, el) => $jobPage(el).text().trim()).get().filter(Boolean);
          return lines.join(' ');
        }

        // Try to extract job data from embedded JSON in <script id="__NEXT_DATA__">
        let fullDescription = '';
        let requirements: string[] = [];
        let applicationUrl = fullJobUrl;
        const nextDataScript = $jobPage('script#__NEXT_DATA__').html();
        if (nextDataScript) {
          try {
            const nextData = JSON.parse(nextDataScript);
            const job = nextData.props?.pageProps?.job;
            if (job) {
              // Description: join oKompaniji, opisPosla, kvalifikacije, informacije
              function extractDraftText(draftRaw: string): string {
                if (!draftRaw) return '';
                try {
                  const draft = JSON.parse(draftRaw);
                  return draft.blocks.map((b: any) => b.text).filter(Boolean).join(' ');
                } catch {
                  return '';
                }
              }
              const aboutCompany = extractDraftText(job.oKompaniji);
              const jobDescriptionSection = extractDraftText(job.opisPosla);
              const qualifications = extractDraftText(job.kvalifikacije);
              const additionalInfo = extractDraftText(job.informacije);
              fullDescription = [
                aboutCompany && `O kompaniji:\n${aboutCompany}`,
                jobDescriptionSection && `Opis posla:\n${jobDescriptionSection}`,
                qualifications && `Kvalifikacije:\n${qualifications}`,
                additionalInfo && `Dodatne Informacije:\n${additionalInfo}`
              ].filter(Boolean).join('\n\n');
              // Requirements from tagsList
              if (Array.isArray(job.tagsList)) {
                requirements = job.tagsList.map((t: any) => t.name).filter(Boolean);
              }
              // Application URL: use job.cta if available and valid, else fallback
              if (typeof job.cta === 'string' && job.cta.startsWith('http')) {
                applicationUrl = job.cta;
              }
            }
          } catch (err) {
            // fallback to previous logic if JSON parse fails
          }
        }
        // Fallback: if fullDescription is empty, get all text from <span data-text="true"> in div.pt-16
        if (!fullDescription) {
          const contentDiv = $jobPage('div.pt-16').first();
          const fallbackSpans = contentDiv.find('span[data-text="true"]').map((_: number, el: any) => $jobPage(el).text().trim()).get().filter(Boolean);
          fullDescription = fallbackSpans.join(' ');
        }
        // Fallback: if requirements is empty, use previous logic
        if (!requirements.length) {
          // Try to find requirements as tags or comma/space separated list after location
          let reqs: string[] = [];
          const reqNode = $jobPage('h1').first().next().next();
          if (reqNode.length) {
            const tagReqs = reqNode.find('span, a, div').map((_, el) => $jobPage(el).text().trim()).get().filter(Boolean);
            if (tagReqs.length > 0) {
              reqs = tagReqs;
            } else {
              const reqText = reqNode.text().trim();
              if (reqText) {
                reqs = reqText.split(/,|\||\n/).map(r => r.trim()).filter(Boolean);
              }
            }
          }
          if (reqs.length === 1 && reqs[0].includes(' ')) {
            reqs = reqs[0].split(' ').map(r => r.trim()).filter(Boolean);
          }
          requirements = [...new Set(reqs)];
        }

        // After requirements extraction logic:
        requirements = [...new Set(requirements)];

        // Determine job level based on keywords in title and description
        const titleLower = title.toLowerCase();
        const descriptionLower = fullDescription.toLowerCase();
        let jobLevel = "Junior"; // Default level
        if (titleLower.includes("praksa") || descriptionLower.includes("praksa")) {
          jobLevel = "Praksa";
        } else if (titleLower.includes("junior") || descriptionLower.includes("junior")) {
          jobLevel = "Junior";
        }

        if (title && companyFinal) {
          // Extract company logo from <img> in the main job header if available
          let companyLogo = `/placeholder.svg?height=60&width=60&text=${getInitials(companyFinal)}`;
          const logoImg = $jobPage('img.w-16.block.m-auto.rounded-full').first();
          if (logoImg.length) {
            const logoSrc = logoImg.attr('src');
            if (logoSrc && logoSrc.startsWith('http')) {
              companyLogo = logoSrc;
            }
          }
          jobs.push({
            title: title.replace(/\s+/g, ' ').trim(),
            company: companyFinal.replace(/\s+/g, ' ').trim(),
            companyLogo: companyLogo,
            location: locationFinal.replace(/\s+/g, ' ').trim(),
            type: typeFinal.replace(/\s+/g, ' ').trim(),
            category: "IT",
            level: jobLevel,
            description: fullDescription,
            requirements: requirements,
            benefits: [],
            salary: salary.replace(/\s+/g, ' ').trim(),
            applicationUrl: applicationUrl,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            isActive: true,
            featured: false,
            employerId: null,
            source: 'dzobs',
          });
          console.log(`Successfully scraped job: ${title}`);
        }

        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error fetching job details from ${fullJobUrl}:`, error instanceof Error ? error.message : String(error));
        continue;
      }
    }

    // If no jobs found, just log the information
    if (jobs.length === 0) {
      console.log("No new Junior jobs found on dzobs.com");
    }

    console.log(`Successfully scraped ${jobs.length} new Junior positions from dzobs.com`);

  } catch (error) {
    console.error("Error scraping dzobs.com:", error);
  }
  return jobs;
}

export async function saveScrapedJobs(jobs: ScrapedJob[]) {
  const db = await getDatabase()
  const collection = db.collection("ScrapedJobs")
  
  console.log(`Attempting to save ${jobs.length} scraped jobs to database`)
  
  if (jobs.length > 0) {
    try {
      const result = await collection.insertMany(jobs)
      console.log(`Successfully saved ${result.insertedCount} jobs to database`)
    } catch (error) {
      console.error("Error saving jobs to database:", error)
    }
  } else {
    console.log("No jobs to save")
  }
}

export async function runAllScrapers() {
  console.log("Starting all scrapers...")
  
  const mojposaoJobs = await scrapeMojPosao()
  console.log(`Scraped ${mojposaoJobs.length} jobs from mojposao.ba`)
  
  const dzobsJobs = await scrapeDzobs()
  console.log(`Scraped ${dzobsJobs.length} jobs from dzobs.com`)
  
  const allJobs = [...mojposaoJobs, ...dzobsJobs]
  console.log(`Total jobs to save: ${allJobs.length}`)
  
  await saveScrapedJobs(allJobs)
} 