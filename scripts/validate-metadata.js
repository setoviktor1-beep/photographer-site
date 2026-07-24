#!/usr/bin/env node
/**
 * Validate metadata: canonical URLs, OG tags, JSON-LD, sitemap, robots, llms.txt
 */

const fs = require('fs')
const path = require('path')

const distDir = path.join(process.cwd(), 'dist')
const errors = []
const warnings = []

function check(condition, msg) {
  if (!condition) errors.push(msg)
}

function warn(condition, msg) {
  if (!condition) warnings.push(msg)
}

// Check required files exist
const requiredFiles = [
  'robots.txt',
  'sitemap.xml',
  'llms.txt',
  'llms-full.txt',
  'feed.xml',
  'structured-data.json',
  'index.html',
  'portfolio.html',
  'services.html',
  'about.html',
  'contact.html',
]

for (const file of requiredFiles) {
  const filePath = path.join(distDir, file)
  check(fs.existsSync(filePath), `Missing required file: ${file}`)
}

// Validate robots.txt
const robotsPath = path.join(distDir, 'robots.txt')
if (fs.existsSync(robotsPath)) {
  const robots = fs.readFileSync(robotsPath, 'utf8')
  check(robots.includes('User-agent: *'), 'robots.txt missing User-agent: *')
  check(robots.includes('Sitemap:'), 'robots.txt missing Sitemap reference')
  check(!robots.includes('llmx.txt'), 'robots.txt should not reference llmx.txt')
}

// Validate sitemap.xml
const sitemapPath = path.join(distDir, 'sitemap.xml')
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8')
  check(sitemap.includes('<?xml'), 'sitemap.xml not valid XML')
  check(sitemap.includes('<urlset'), 'sitemap.xml missing urlset element')
  check(sitemap.includes('https://setoviktor1-beep.github.io/photographer-site/'), 'sitemap.xml missing canonical URLs')
}

// Validate llms.txt
const llmsPath = path.join(distDir, 'llms.txt')
if (fs.existsSync(llmsPath)) {
  const llms = fs.readFileSync(llmsPath, 'utf8')
  check(llms.startsWith('# '), 'llms.txt should start with H1 title')
  check(llms.includes('## '), 'llms.txt should have sections')
}

// Validate llms-full.txt
const llmsFullPath = path.join(distDir, 'llms-full.txt')
if (fs.existsSync(llmsFullPath)) {
  const llmsFull = fs.readFileSync(llmsFullPath, 'utf8')
  check(llmsFull.includes('## '), 'llms-full.txt should have sections')
  check(llmsFull.length > 500, 'llms-full.txt should be comprehensive')
}

// Validate structured data (JSON-LD)
const jsonLdPath = path.join(distDir, 'structured-data.json')
if (fs.existsSync(jsonLdPath)) {
  try {
    const jsonLd = JSON.parse(fs.readFileSync(jsonLdPath, 'utf8'))
    check(jsonLd.website, 'structured-data.json missing website schema')
    check(jsonLd.website['@type'] === 'WebSite', 'website schema wrong type')
    check(jsonLd.professionalService, 'structured-data.json missing professionalService schema')
    check(jsonLd.professionalService['@type'] === 'ProfessionalService', 'professionalService schema wrong type')
    if (jsonLd.faqs && jsonLd.faqs.length > 0) {
      check(jsonLd.faqs[0]['@type'] === 'Question', 'FAQ schema wrong type')
    }
  } catch (e) {
    errors.push(`structured-data.json is not valid JSON: ${e.message}`)
  }
}

// Validate HTML files for basic structure
const htmlFiles = fs.readdirSync(distDir).filter((f) => f.endsWith('.html'))
for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(distDir, file), 'utf8')
  check(html.includes('<!DOCTYPE html>'), `${file}: missing DOCTYPE`)
  check(html.includes('<meta name="viewport"'), `${file}: missing viewport meta`)
  check(html.includes('<html'), `${file}: missing html tag`)
  check(html.includes('</html>'), `${file}: missing closing html tag`)
  // Check for base path awareness (links should work on GitHub Pages)
  warn(html.includes('AURA STUDIO'), `${file}: should contain site name`)
}

// Check project pages
const portfolioDir = path.join(distDir, 'portfolio')
if (fs.existsSync(portfolioDir)) {
  const projectDirs = fs.readdirSync(portfolioDir).filter((f) => 
    fs.statSync(path.join(portfolioDir, f)).isDirectory()
  )
  for (const projDir of projectDirs) {
    const indexPath = path.join(portfolioDir, projDir, 'index.html')
    if (fs.existsSync(indexPath)) {
      const html = fs.readFileSync(indexPath, 'utf8')
      check(html.includes('"@type": "ImageObject"'), `${projDir}/index.html: missing ImageObject schema`)
      check(html.includes('"@type": "BreadcrumbList"'), `${projDir}/index.html: missing BreadcrumbList schema`)
      check(html.includes('rel="canonical"'), `${projDir}/index.html: missing canonical URL`)
      check(html.includes('og:title'), `${projDir}/index.html: missing Open Graph tags`)
    }
  }
}

// Report
if (warnings.length > 0) {
  console.log('Warnings:')
  warnings.forEach((w) => console.log(`  ⚠️  ${w}`))
}

if (errors.length > 0) {
  console.error('\nValidation FAILED:')
  errors.forEach((e) => console.error(`  ❌ ${e}`))
  process.exit(1)
} else {
  console.log(`✅ All metadata validations passed (${warnings.length} warnings)`)
}
