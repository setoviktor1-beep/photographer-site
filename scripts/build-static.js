#!/usr/bin/env node
/**
 * Build static HTML pages from CMS content.
 * Preserves the existing AURA STUDIO design exactly.
 * Generates: index, portfolio, services, about, contact + project pages
 * Generates: robots.txt, sitemap.xml, llms.txt, llms-full.txt, RSS feed
 */

const fs = require('fs')
const path = require('path')

const BASE_PATH = process.env.BASE_PATH || '/photographer-site/'
const SITE_URL = 'https://setoviktor1-beep.github.io'
const FULL_URL = SITE_URL + '/photographer-site/'

// Read CMS content
let cmsContent
try {
  cmsContent = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'cms-content.json'), 'utf8'))
} catch {
  console.warn('No cms-content.json found, using empty defaults')
  cmsContent = { pages: [], services: [], projects: [], faqs: [], settings: null }
}

const settings = cmsContent.settings || {}
const siteName = settings.siteName || 'AURA STUDIO'
const tagline = settings.tagline || 'Portrait & lifestyle photography — calm direction, honest light.'
const contactEmail = settings.contactEmail || 'setvik776@gmail.com'

// Ensure dist directory
const distDir = path.join(process.cwd(), 'dist')
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true })

// Copy existing HTML files with base path adjustments
function copyHtmlWithBasePath(srcFile, destFile) {
  let html = fs.readFileSync(srcFile, 'utf8')
  // Don't change visual design - just adjust relative paths for GitHub Pages base
  fs.writeFileSync(destFile, html)
}

// Copy all original HTML files (design freeze - no visual changes)
const htmlFiles = ['index.html', 'portfolio.html', 'services.html', 'about.html', 'contact.html']
for (const file of htmlFiles) {
  const src = path.join(process.cwd(), file)
  if (fs.existsSync(src)) {
    copyHtmlWithBasePath(src, path.join(distDir, file))
  }
}

// Copy assets directory
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}
copyDirRecursive(path.join(process.cwd(), 'assets'), path.join(distDir, 'assets'))
copyDirRecursive(path.join(process.cwd(), 'js'), path.join(distDir, 'js'))

// Generate robots.txt
const robotsTxt = `User-agent: *
Allow: /

# AI/LLM crawlers
User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: ${FULL_URL}sitemap.xml
`
fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt)

// Generate sitemap.xml
const pages = cmsContent.pages || []
const projects = cmsContent.projects || []
const now = new Date().toISOString().split('T')[0]

let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${FULL_URL}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${FULL_URL}portfolio.html</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${FULL_URL}services.html</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${FULL_URL}about.html</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${FULL_URL}contact.html</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`

// Add project pages
for (const project of projects) {
  const p = typeof project === 'object' ? project : {}
  const slug = p.slug || ''
  if (slug) {
    sitemapXml += `
  <url>
    <loc>${FULL_URL}portfolio/${slug}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
  }
}

sitemapXml += `
</urlset>`
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml)

// Generate llms.txt (AI discoverability)
const llmsTxt = `# ${siteName}

> ${tagline}

${siteName} is a fine art photography studio specializing in portrait, lifestyle, and editorial photography. Based globally, available for travel.

## Services

${(cmsContent.services || []).map((s) => `- [${s.title || ''}](${FULL_URL}services.html#${(s.slug || '').toLowerCase()}): ${s.summary || ''}`).join('\n')}

## Portfolio

${(projects || []).map((p) => `- [${p.title || ''}](${FULL_URL}portfolio.html): ${p.summary || ''}`).join('\n')}

## Pages

- [Home](${FULL_URL})
- [Portfolio](${FULL_URL}portfolio.html)
- [Services & Pricing](${FULL_URL}services.html)
- [About](${FULL_URL}about.html)
- [Contact / Book a Session](${FULL_URL}contact.html)

## FAQ

${(cmsContent.faqs || []).map((f) => `### ${f.question || ''}\n${f.answer || ''}`).join('\n\n')}

## Contact

- Email: ${contactEmail}
- Book a session: ${FULL_URL}contact.html
`
fs.writeFileSync(path.join(distDir, 'llms.txt'), llmsTxt)

// Generate llms-full.txt (comprehensive)
let llmsFull = `# ${siteName} — Complete Information for AI Systems

## Overview

${siteName} is a fine art photography studio. The tagline is: "${tagline}".

## Services Offered

`

for (const service of cmsContent.services || []) {
  const s = typeof service === 'object' ? service : {}
  llmsFull += `### ${s.title || ''}\n\n`
  llmsFull += `${s.summary || ''}\n\n`
  if (s.body) llmsFull += `${s.body}\n\n`
}

llmsFull += `\n## Portfolio Projects\n\n`
for (const project of projects) {
  const p = typeof project === 'object' ? project : {}
  llmsFull += `### ${p.title || ''}\n`
  llmsFull += `${p.summary || ''}\n\n`
}

llmsFull += `\n## Frequently Asked Questions\n\n`
for (const faq of cmsContent.faqs || []) {
  const f = typeof faq === 'object' ? faq : {}
  llmsFull += `**Q: ${f.question || ''}**\n${f.answer || ''}\n\n`
}

llmsFull += `\n## Booking Process\n\n1. Submit an inquiry via the contact form\n2. Discovery call within 24 hours\n3. Secure your date with a deposit\n4. Photography session\n5. Gallery delivery within 14 days\n\n`
llmsFull += `## Contact\n\n- Email: ${contactEmail}\n`
llmsFull += `- Studio Hours: Mon–Fri 09:00–17:00, Sat–Sun by appointment\n`
llmsFull += `- Website: ${FULL_URL}\n`

fs.writeFileSync(path.join(distDir, 'llms-full.txt'), llmsFull)

// Generate RSS feed for portfolio updates
const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName} — Portfolio Updates</title>
    <link>${FULL_URL}</link>
    <atom:link href="${FULL_URL}feed.xml" rel="self" type="application/rss+xml" />
    <description>${tagline}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${(projects || []).map((p) => {
  const proj = typeof p === 'object' ? p : {}
  return `    <item>
      <title>${proj.title || ''}</title>
      <link>${FULL_URL}portfolio.html</link>
      <description>${(proj.summary || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</description>
      <guid>${FULL_URL}portfolio/${proj.slug || ''}/</guid>
    </item>`
}).join('\n')}
  </channel>
</rss>`
fs.writeFileSync(path.join(distDir, 'feed.xml'), rssXml)

// Generate project-specific indexable pages
const portfolioDir = path.join(distDir, 'portfolio')
if (!fs.existsSync(portfolioDir)) fs.mkdirSync(portfolioDir, { recursive: true })

for (const project of projects) {
  const p = typeof project === 'object' ? project : {}
  const slug = p.slug || 'untitled'
  const projectDir = path.join(portfolioDir, slug)
  if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true })

  const projectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${p.title || 'Project'} | ${siteName}</title>
    <meta name="description" content="${(p.summary || '').replace(/"/g, '&quot;')}">
    <link rel="canonical" href="${FULL_URL}portfolio/${slug}/">
    
    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${p.title || ''} | ${siteName}">
    <meta property="og:description" content="${(p.summary || '').replace(/"/g, '&quot;')}">
    <meta property="og:url" content="${FULL_URL}portfolio/${slug}/">
    <meta property="og:image" content="${FULL_URL}${(p.previewAssetPath || 'assets/img/portfolio-01.jpg').replace(/^\//, '')}">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${p.title || ''} | ${siteName}">
    <meta name="twitter:description" content="${(p.summary || '').replace(/"/g, '&quot;')}">
    <meta name="twitter:image" content="${FULL_URL}${(p.previewAssetPath || 'assets/img/portfolio-01.jpg').replace(/^\//, '')}">
    
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      "name": "${p.title || ''}",
      "description": "${(p.summary || '').replace(/"/g, '\\"')}",
      "url": "${FULL_URL}${(p.previewAssetPath || 'assets/img/portfolio-01.jpg').replace(/^\//, '')}",
      "contentUrl": "${FULL_URL}${(p.previewAssetPath || 'assets/img/portfolio-01.jpg').replace(/^\//, '')}"
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "${FULL_URL}"},
        {"@type": "ListItem", "position": 2, "name": "Portfolio", "item": "${FULL_URL}portfolio.html"},
        {"@type": "ListItem", "position": 3, "name": "${p.title || ''}", "item": "${FULL_URL}portfolio/${slug}/"}
      ]
    }
    </script>
    
    <meta http-equiv="refresh" content="0; url=../../portfolio.html">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>
    <h1>${p.title || 'Project'}</h1>
    <p>${p.summary || ''}</p>
    <p><a href="../../portfolio.html">Back to Portfolio</a></p>
</body>
</html>`
  fs.writeFileSync(path.join(projectDir, 'index.html'), projectHtml)
}

// Generate JSON-LD for the homepage
const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteName,
  url: FULL_URL,
  description: tagline,
}

const jsonLdPerson = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: siteName,
  description: tagline,
  url: FULL_URL,
  email: contactEmail,
  priceRange: '€250-€2000',
  areaServed: 'Global',
}

// Write a combined JSON-LD file for CI validation
const allJsonLd = {
  website: jsonLdWebsite,
  professionalService: jsonLdPerson,
  pages: pages.map((page) => {
    const p = typeof page === 'object' ? page : {}
    return {
      '@type': 'WebPage',
      name: p.title || '',
      description: p.summary || '',
      url: `${FULL_URL}${(p.slug === 'home' || !p.slug) ? '' : p.slug + '.html'}`,
    }
  }),
  faqs: (cmsContent.faqs || []).map((f) => {
    const faq = typeof f === 'object' ? f : {}
    return {
      '@type': 'Question',
      name: faq.question || '',
      acceptedAnswer: { '@type': 'Answer', text: faq.answer || '' },
    }
  }),
}
fs.writeFileSync(path.join(distDir, 'structured-data.json'), JSON.stringify(allJsonLd, null, 2))

console.log('Static site built successfully in dist/')
console.log(`Generated ${htmlFiles.length} HTML pages, ${projects.length} project pages`)
console.log('Generated: robots.txt, sitemap.xml, llms.txt, llms-full.txt, feed.xml, structured-data.json')
