/**
 * DEMO API - synthetic data for local UI work only.
 *
 * This is NOT the EasyOffer backend. Never use it for demos, screenshots or
 * thesis evidence: start the real offer-service on port 8080 for that.
 * See the "Demo API" section in README.md.
 */
import http from 'node:http'

const categories = ['JAVA', 'PYTHON', 'JAVASCRIPT', 'DATA', 'DEVOPS', 'QA']
const companies = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark Industries']
const cities = ['Warsaw', 'Kraków', 'Wrocław', 'Gdańsk', 'Remote']
const sources = ['JUST_JOIN_IT', 'THE_PROTOCOL_IT']
const levels = ['JUNIOR', 'MID', 'SENIOR']
const employment = ['B2B', 'UZ']
const modes = ['REMOTE', 'HYBRID', 'OFFICE']
const techByCategory = {
  JAVA: ['Java', 'Spring', 'Hibernate', 'SQL', 'Kafka'],
  PYTHON: ['Python', 'Django', 'FastAPI', 'Pandas', 'SQL'],
  JAVASCRIPT: ['JavaScript', 'React', 'TypeScript', 'Node.js', 'CSS'],
  DATA: ['SQL', 'Python', 'Spark', 'Airflow', 'Tableau'],
  DEVOPS: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'Linux'],
  QA: ['Selenium', 'Cypress', 'Java', 'Postman', 'SQL'],
}

function pad(value) {
  return String(value).padStart(2, '0')
}

const offers = Array.from({ length: 57 }, (_, index) => {
  const id = index + 1
  const category = categories[index % categories.length]
  const level = levels[index % levels.length]
  const month = (index % 10) + 1
  const day = (index % 27) + 1
  const min = 8000 + (index % 12) * 1500
  const max = min + 4000 + (index % 5) * 1000
  return {
    id,
    externalId: `ext-${1000 + id}`,
    title: `${level === 'SENIOR' ? 'Senior ' : level === 'JUNIOR' ? 'Junior ' : ''}${category} Engineer ${id}`,
    companyName: companies[index % companies.length],
    location: cities[index % cities.length],
    description: `Sample description for offer ${id}.\nSecond paragraph with details.`,
    experienceLevel: level,
    employmentType: employment[index % employment.length],
    workMode: modes[index % modes.length],
    salaryMin: min,
    salaryMax: max,
    salaryUnit: 'MONTH',
    currency: index % 7 === 0 ? 'EUR' : 'PLN',
    salaryType: index % 3 === 0 ? 'NET' : 'GROSS',
    source: sources[index % sources.length],
    url: `https://example.com/offers/${id}`,
    language: index % 2 === 0 ? 'en' : 'pl',
    createdAt: `2026-${pad(month)}-${pad(day)}T09:15:00`,
    updatedAt: `2026-${pad(month)}-${pad(day)}T10:00:00`,
    technologies: techByCategory[category],
    publishedAt: `2026-${pad(month)}-${pad(day)}T08:00:00`,
    categoryName: category,
  }
})

function pageOf(items, searchParams) {
  const page = Math.max(0, Number(searchParams.get('page') ?? 0) || 0)
  const size = Math.min(200, Math.max(1, Number(searchParams.get('size') ?? 20) || 20))
  const sort = searchParams.get('sort') ?? 'publishedAt,desc'
  const [field, direction = 'desc'] = sort.split(',')
  const sorted = [...items].sort((a, b) => {
    const left = a[field] ?? ''
    const right = b[field] ?? ''
    const result = left < right ? -1 : left > right ? 1 : 0
    return direction === 'asc' ? result : -result
  })
  const totalElements = sorted.length
  const totalPages = Math.ceil(totalElements / size)
  const start = page * size
  return {
    content: sorted.slice(start, start + size),
    page,
    size,
    totalElements,
    totalPages,
    first: page === 0,
    last: page >= totalPages - 1,
  }
}

function matches(offer, searchParams) {
  const lists = {
    titles: (value) => offer.title.toLowerCase().includes(value.toLowerCase()),
    companyNames: (value) => offer.companyName.toLowerCase() === value.toLowerCase(),
    categoryNames: (value) => offer.categoryName === value,
    experienceLevels: (value) => offer.experienceLevel === value,
    employmentTypes: (value) => offer.employmentType === value,
    workModes: (value) => offer.workMode === value,
    sources: (value) => offer.source === value,
    technologies: (value) => offer.technologies.includes(value),
    currencies: (value) => offer.currency === value,
    ids: (value) => offer.id === Number(value),
  }

  for (const [key, test] of Object.entries(lists)) {
    const values = searchParams.getAll(key)
    if (values.length > 0 && !values.some((value) => test(value))) {
      return false
    }
  }

  const salaryFrom = searchParams.get('salaryFrom')
  if (salaryFrom && offer.salaryMax < Number(salaryFrom)) return false
  const salaryTo = searchParams.get('salaryTo')
  if (salaryTo && offer.salaryMin > Number(salaryTo)) return false

  const publishedFrom = searchParams.get('publishedAtFrom')
  if (publishedFrom && offer.publishedAt < publishedFrom) return false
  const publishedTo = searchParams.get('publishedAtTo')
  if (publishedTo && offer.publishedAt > publishedTo) return false

  return true
}

function send(response, status, body) {
  const payload = JSON.stringify(body)
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  })
  response.end(payload)
}

function notFound(response, message) {
  send(response, 404, {
    timestamp: new Date().toISOString(),
    status: 404,
    error: 'Not Found',
    message,
    details: [],
  })
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost:8080')
  const path = url.pathname

  if (path === '/v1.0/categories') {
    send(response, 200, categories.map((categoryName) => ({ categoryName })))
    return
  }

  if (path === '/offers') {
    send(response, 200, pageOf(offers, url.searchParams))
    return
  }

  if (path === '/offers/search') {
    send(response, 200, pageOf(offers.filter((offer) => matches(offer, url.searchParams)), url.searchParams))
    return
  }

  const offerMatch = path.match(/^\/offers\/(\d+)$/)
  if (offerMatch) {
    const offer = offers.find((item) => item.id === Number(offerMatch[1]))
    if (!offer) {
      notFound(response, `Offer not found for id: ${offerMatch[1]}`)
      return
    }
    send(response, 200, offer)
    return
  }

  if (path === '/v1.0/analytics/technologies/popularity') {
    send(response, 200, {
      technologyNormalizationVersion: 'v1',
      deduplicationVersion: 'v1',
      periodField: 'publishedAt',
      categoryName: url.searchParams.get('categoryName'),
      sources: url.searchParams.getAll('sources'),
      dateFrom: url.searchParams.get('dateFrom'),
      dateTo: url.searchParams.get('dateTo'),
      rawOfferCount: offers.length,
      uniqueOfferCount: offers.length,
      eligibleOfferCount: offers.length,
      page: 0,
      size: 50,
      totalElements: 0,
      totalPages: 0,
      technologies: [],
    })
    return
  }

  if (path === '/v1.0/analytics/technologies/trend') {
    send(response, 200, {
      technologyName: url.searchParams.get('technologyName'),
      points: [],
      rawOfferCount: 0,
      uniqueOfferCount: 0,
      eligibleOfferCount: 0,
    })
    return
  }

  if (path === '/v1.0/analytics/salaries') {
    send(response, 200, {
      recommendedMinimumSampleSize: 30,
      byCategory: [],
      byExperienceLevel: [],
    })
    return
  }

  if (path === '/v1.0/analytics/salaries/trend') {
    send(response, 200, {
      categoryName: url.searchParams.get('categoryName'),
      currency: url.searchParams.get('currency'),
      employmentType: url.searchParams.get('employmentType'),
      salaryUnit: 'MONTH',
      salaryType: url.searchParams.get('salaryType') ?? 'GROSS',
      points: [],
    })
    return
  }

  if (path === '/v1.0/analytics/data-completeness') {
    send(response, 200, {
      eligibleOfferCount: 0,
      bySource: [],
    })
    return
  }

  notFound(response, `No mock route for ${path}`)
})

server.listen(8080, () => {
  console.log('mock api listening on http://localhost:8080')
})
