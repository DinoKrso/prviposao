// To use this file, run: npm install puppeteer
import puppeteer, { ElementHandle, Page } from 'puppeteer';

export interface PuppeteerScrapedJob {
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  type: string;
  category: string;
  level: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salary: string;
  applicationUrl: string;
  expiresAt: Date;
  isActive: boolean;
  featured: boolean;
  employerId: null;
  source: string;
}

export async function scrapeMojPosaoPuppeteer(): Promise<PuppeteerScrapedJob[]> {
  // If using Puppeteer v20+, you can use headless: 'new'. For older versions, use headless: true
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const jobs: PuppeteerScrapedJob[] = [];
  try {
    await page.goto('https://www.mojposao.ba/poslovi?keyword=junior&page=1', { waitUntil: 'networkidle2' });
    // Wait 5 seconds to ensure the page is fully loaded
    await new Promise(resolve => setTimeout(resolve, 5000));
    // Wait for job links to load (matching Cheerio/axios selector)
    await page.waitForSelector('div.EV5KEN-pg-w a.gwt-Anchor.gwt-HyperAnchor', { visible: true, timeout: 20000 });
    // Extract job links with 'junior' in the title
    const jobLinks = await page.$$eval('div.EV5KEN-pg-w a.gwt-Anchor.gwt-HyperAnchor', (links) =>
      links
        .map(link => {
          const title = link.textContent?.trim() || '';
          const href = (link as HTMLAnchorElement).href || '';
          return { title, href };
        })
        .filter(job => job.title.toLowerCase().includes('junior'))
    );
    for (const { href, title: text } of jobLinks) {
      try {
        const jobPage = await browser.newPage();
        await jobPage.goto(href, { waitUntil: 'networkidle2' });
        // Extract job details
        const job = await jobPage.evaluate(() => {
          const getText = (selector: string) => document.querySelector(selector)?.textContent?.trim() || '';
          const getImg = (selector: string) => (document.querySelector(selector) as HTMLImageElement)?.src || '';
          // Company name
          const company = getText('div.EV5KEN-i-l');
          // Job title
          const title = getText('h1.EV5KEN-i-f.EV5KEN-i-l');
          // Company logo
          let companyLogo = getImg('img.EV5KEN-i-w');
          if (companyLogo && companyLogo.startsWith('//')) companyLogo = 'https:' + companyLogo;
          // Details
          const detailsDiv = document.querySelector('div.EV5KEN-i-q');
          let location = '';
          let description = '';
          if (detailsDiv) {
            // Get the HTML content
            let html = detailsDiv.innerHTML;
            // Replace <br> and <br/> with newlines
            html = html.replace(/<br\s*\/?>/gi, '\n');
            // Replace block tags with newlines (for <p>, <li>, etc.)
            html = html.replace(/<\/(p|li|ul|ol|h[1-6])>/gi, '\n');
            // Remove all other HTML tags
            description = html.replace(/<[^>]+>/g, '');
            // Collapse multiple newlines and trim
            description = description.replace(/\n{2,}/g, '\n').trim();
          }
          // Type
          let type = 'Puno radno vrijeme';
          if (/puno radno vrijeme/i.test(description)) type = 'Puno radno vrijeme';
          else if (/skraćeno radno vrijeme/i.test(description)) type = 'Skraćeno radno vrijeme';
          else if (/praksa/i.test(description)) type = 'Praksa';
          // Requirements and benefits
          let requirements: string[] = [];
          let benefits: string[] = [];
          const reqSection = Array.from(document.querySelectorAll('b')).find(b => b.textContent?.includes('Potrebne kvalifikacije'));
          if (reqSection) {
            const ul = reqSection.parentElement?.nextElementSibling;
            if (ul && ul.tagName === 'UL') {
              requirements = Array.from(ul.querySelectorAll('li')).map(li => li.textContent?.trim() || '').filter(Boolean);
            }
          }
          const benSection = Array.from(document.querySelectorAll('b')).find(b => b.textContent?.includes('Šta nudimo'));
          if (benSection) {
            const ul = benSection.parentElement?.nextElementSibling;
            if (ul && ul.tagName === 'UL') {
              benefits = Array.from(ul.querySelectorAll('li')).map(li => li.textContent?.trim() || '').filter(Boolean);
            }
          }
          // Salary
          let salary = 'Fleksibilno';
          // Application URL: look for the apply button
          let applicationUrl = window.location.href;
          const applyBtn = document.querySelector('a.EV5KEN-Xc-a') as HTMLAnchorElement | null;
          if (applyBtn && applyBtn.href) {
            applicationUrl = applyBtn.href;
          }
          // Parse creation and expiration dates using 'Datum objave' and 'Trajanje oglasa'
          let createdAt = new Date();
          let expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // default 30 days
          let datumObjaveText = null;
          let trajanjeOglasaText = null;
          const dateDivs = Array.from(document.querySelectorAll('div.EV5KEN-i-A'));
          for (const div of dateDivs) {
            const label = div.querySelector('span.EV5KEN-i-j')?.textContent?.trim();
            const value = div.querySelector('span.gwt-InlineLabel')?.textContent?.trim();
            if (label && value) {
              if (label.includes('Datum objave')) {
                datumObjaveText = value;
              } else if (label.includes('Trajanje oglasa')) {
                trajanjeOglasaText = value;
              }
            }
          }
          if (datumObjaveText) {
            const [day, month, year] = datumObjaveText.split('.').map(Number);
            if (day && month && year) {
              createdAt = new Date(Date.UTC(year, month - 1, day));
            }
          }
          let durationDays = 30; // default
          if (trajanjeOglasaText) {
            const daysMatch = trajanjeOglasaText.match(/(\d+)/);
            if (daysMatch) {
              durationDays = parseInt(daysMatch[1]);
            }
          }
          expiresAt = new Date(createdAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
          return {
            title,
            company,
            companyLogo,
            location: location || 'Nepoznato',
            type,
            category: 'IT',
            level: 'Junior',
            description,
            requirements,
            benefits,
            salary,
            applicationUrl,
            createdAt,
            updatedAt: createdAt,
            expiresAt,
            isActive: true,
            featured: false,
            employerId: null,
            source: 'mojposao',
          };
        });
        jobs.push(job);
        await jobPage.close();
      } catch (err) {
        console.error('Error scraping job detail:', href, err);
        continue;
      }
    }
  } finally {
    await browser.close();
  }
  return jobs;
} 