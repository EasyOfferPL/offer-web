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
  const hasSalary = index % 9 !== 4
  return {
    id,
    externalId: `ext-${1000 + id}`,
    title: `${level === 'SENIOR' ? 'Senior ' : level === 'JUNIOR' ? 'Junior ' : ''}${category} Engineer ${id}`,
    companyName: companies[index % companies.length],
    location: index % 13 === 0 ? null : cities[index % cities.length],
    description: `Sample description for offer ${id}.\nSecond paragraph with details.`,
    experienceLevel: index % 19 === 0 ? null : level,
    employmentType: employment[index % employment.length],
    workMode: index % 11 === 0 ? null : modes[index % modes.length],
    salaryMin: hasSalary ? min : null,
    salaryMax: hasSalary ? max : null,
    salaryUnit: 'MONTH',
    currency: index % 7 === 0 ? 'EUR' : 'PLN',
    salaryType: index % 5 === 0 ? 'NET' : 'GROSS',
    source: sources[index % sources.length],
    url: `https://example.com/offers/${id}`,
    language: index % 2 === 0 ? 'en' : 'pl',
    createdAt: `2026-${pad(month)}-${pad(day)}T09:15:00`,
    updatedAt: `2026-${pad(month)}-${pad(day)}T10:00:00`,
    technologies: index % 7 === 0 ? [] : techByCategory[category],
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

/* ---------- Demo analytics helpers ---------- */

const RECOMMENDED_MIN_SAMPLE = 30
const COMPLETENESS_FIELDS = [
  'SALARY',
  'TECHNOLOGIES',
  'EXPERIENCE_LEVEL',
  'LOCATION',
  'WORK_MODE',
  'PUBLISHED_AT',
]
const FIELD_TESTS = {
  SALARY: (offer) => offer.salaryMin != null || offer.salaryMax != null,
  TECHNOLOGIES: (offer) => Array.isArray(offer.technologies) && offer.technologies.length > 0,
  EXPERIENCE_LEVEL: (offer) => Boolean(offer.experienceLevel),
  LOCATION: (offer) => Boolean(offer.location),
  WORK_MODE: (offer) => Boolean(offer.workMode),
  PUBLISHED_AT: (offer) => Boolean(offer.publishedAt),
}

function round2(value) {
  return Math.round(value * 100) / 100
}

function percent(part, total) {
  return total > 0 ? round2((part / total) * 100) : 0
}

function datePart(offer) {
  return (offer.publishedAt ?? '').slice(0, 10)
}

function sourceParams(searchParams) {
  return searchParams
    .getAll('sources')
    .flatMap((value) => value.split(','))
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean)
}

function analyticsScope(searchParams, { useDates = true } = {}) {
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')
  const sources = sourceParams(searchParams)
  const categoryName = searchParams.get('categoryName')

  return offers.filter((offer) => {
    if (sources.length > 0 && !sources.includes(offer.source)) return false
    if (categoryName && offer.categoryName !== categoryName) return false
    if (useDates) {
      const published = datePart(offer)
      if (dateFrom && published < dateFrom) return false
      if (dateTo && published > dateTo) return false
    }
    return true
  })
}

function monthKeys(dateFrom, dateTo) {
  const dates = offers.map(datePart).filter(Boolean).sort()
  const start = (dateFrom ?? dates[0] ?? '2026-01-01').slice(0, 7)
  const end = (dateTo ?? dates[dates.length - 1] ?? '2026-10-01').slice(0, 7)
  const [startYear, startMonth] = start.split('-').map(Number)
  const [endYear, endMonth] = end.split('-').map(Number)
  const months = []
  let year = startYear
  let month = startMonth

  while (
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    (year < endYear || (year === endYear && month <= endMonth)) &&
    months.length < 240
  ) {
    months.push(`${year}-${pad(month)}`)
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
  }

  return months
}

function quantile(sorted, q) {
  if (sorted.length === 0) return 0
  const position = (sorted.length - 1) * q
  const base = Math.floor(position)
  const rest = position - base
  const next = sorted[base + 1]
  return next === undefined ? sorted[base] : sorted[base] + rest * (next - sorted[base])
}

function comparableSalary(offer) {
  if (offer.salaryMin != null && offer.salaryMax != null) {
    return (offer.salaryMin + offer.salaryMax) / 2
  }
  return offer.salaryMin ?? offer.salaryMax
}

function salaryStatistic(groupValue, groupedOffers) {
  const first = groupedOffers[0]
  const values = groupedOffers
    .map(comparableSalary)
    .filter(Number.isFinite)
    .sort((a, b) => a - b)
  const average = values.reduce((sum, value) => sum + value, 0) / values.length

  return {
    groupValue,
    currency: first.currency,
    salaryUnit: first.salaryUnit,
    employmentType: first.employmentType,
    salaryType: first.salaryType,
    minimumSalary: round2(values[0]),
    percentile25Salary: round2(quantile(values, 0.25)),
    averageSalary: round2(average),
    medianSalary: round2(quantile(values, 0.5)),
    percentile75Salary: round2(quantile(values, 0.75)),
    maximumSalary: round2(values[values.length - 1]),
    offersCount: values.length,
    meetsRecommendedSampleSize: values.length >= RECOMMENDED_MIN_SAMPLE,
  }
}

function salaryGroups(items, keyFn) {
  const groups = new Map()

  for (const offer of items) {
    const groupValue = keyFn(offer)
    const salary =
      offer.salaryMin != null || offer.salaryMax != null
    if (!groupValue || !salary || !offer.currency || !offer.salaryUnit) continue
    if (!offer.employmentType || !offer.salaryType) continue

    const key = [
      groupValue,
      offer.currency,
      offer.salaryUnit,
      offer.employmentType,
      offer.salaryType,
    ].join('|')
    const group = groups.get(key)
    if (group) {
      group.offers.push(offer)
    } else {
      groups.set(key, { groupValue, offers: [offer] })
    }
  }

  return [...groups.values()]
    .map((group) => salaryStatistic(group.groupValue, group.offers))
    .sort(
      (left, right) =>
        left.groupValue.localeCompare(right.groupValue) ||
        left.currency.localeCompare(right.currency) ||
        left.employmentType.localeCompare(right.employmentType) ||
        left.salaryType.localeCompare(right.salaryType),
    )
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

  if (path === '/v1.0/analytics') {
    const counts = new Map(categories.map((categoryName) => [categoryName, 0]))
    for (const offer of offers) {
      counts.set(offer.categoryName, (counts.get(offer.categoryName) ?? 0) + 1)
    }

    send(response, 200, {
      categoriesStatistic: [...counts.entries()].map(([categoryName, offersCount]) => ({
        categoryName,
        offersCount,
      })),
      newestJobOffers: [...offers]
        .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
        .slice(0, 5),
    })
    return
  }

  if (path === '/v1.0/analytics/technologies/popularity') {
    const params = url.searchParams
    const scoped = analyticsScope(params)
    const denominator = scoped.length
    const counts = new Map()

    for (const offer of scoped) {
      for (const technology of new Set(offer.technologies ?? [])) {
        counts.set(technology, (counts.get(technology) ?? 0) + 1)
      }
    }

    const all = [...counts.entries()]
      .map(([technologyName, count]) => ({
        technologyName,
        count,
        denominator,
        sharePercentage: percent(count, denominator),
      }))
      .sort(
        (left, right) =>
          right.count - left.count ||
          left.technologyName.localeCompare(right.technologyName),
      )

    const page = Math.max(0, Number(params.get('page') ?? 0) || 0)
    const size = Math.min(500, Math.max(1, Number(params.get('size') ?? 50) || 50))
    const totalElements = all.length
    const totalPages = Math.ceil(totalElements / size)

    send(response, 200, {
      technologyNormalizationVersion: 'demo-v1',
      deduplicationVersion: 'demo-v1',
      periodField: 'publishedAt',
      categoryName: params.get('categoryName'),
      sources: sourceParams(params),
      dateFrom: params.get('dateFrom'),
      dateTo: params.get('dateTo'),
      rawOfferCount: scoped.length,
      uniqueOfferCount: scoped.length,
      eligibleOfferCount: denominator,
      page,
      size,
      totalElements,
      totalPages,
      technologies: all.slice(page * size, page * size + size),
    })
    return
  }

  if (path === '/v1.0/analytics/technologies/trend') {
    const params = url.searchParams
    const scoped = analyticsScope(params)
    const technologyName = (params.get('technologyName') ?? '').trim()
    const technologyKey = technologyName.toLowerCase()
    const points = monthKeys(params.get('dateFrom'), params.get('dateTo')).map(
      (month) => {
        const monthly = scoped.filter((offer) => datePart(offer).slice(0, 7) === month)
        const count = monthly.filter((offer) =>
          (offer.technologies ?? []).some(
            (technology) => technology.toLowerCase() === technologyKey,
          ),
        ).length

        return {
          month,
          count,
          denominator: monthly.length,
          sharePercentage: percent(count, monthly.length),
        }
      },
    )

    send(response, 200, {
      technologyNormalizationVersion: 'demo-v1',
      deduplicationVersion: 'demo-v1',
      periodField: 'publishedAt',
      monthAssignment: 'publishedAt',
      technologyName,
      categoryName: params.get('categoryName'),
      sources: sourceParams(params),
      dateFrom: params.get('dateFrom'),
      dateTo: params.get('dateTo'),
      rawOfferCount: scoped.length,
      uniqueOfferCount: scoped.length,
      eligibleOfferCount: scoped.length,
      points,
    })
    return
  }

  if (path === '/v1.0/analytics/salaries') {
    const params = url.searchParams
    const categoryName = params.get('categoryName')
    const experienceLevel = params.get('experienceLevel')
    const scoped = offers.filter(
      (offer) =>
        (!categoryName || offer.categoryName === categoryName) &&
        (!experienceLevel || offer.experienceLevel === experienceLevel),
    )

    send(response, 200, {
      salaryNormalizationVersion: 'demo-v1',
      quantileMethod: 'linear interpolation',
      recommendedMinimumSampleSize: RECOMMENDED_MIN_SAMPLE,
      byCategory: salaryGroups(scoped, (offer) => offer.categoryName),
      byExperienceLevel: salaryGroups(scoped, (offer) => offer.experienceLevel),
    })
    return
  }

  if (path === '/v1.0/analytics/salaries/trend') {
    const params = url.searchParams
    const categoryName = params.get('categoryName') ?? ''
    const currency = (params.get('currency') ?? '').toUpperCase()
    const employmentType = (params.get('employmentType') ?? '').toUpperCase()
    const salaryType = params.get('salaryType') ?? 'GROSS'
    const experienceLevel = params.get('experienceLevel')
    const dateFrom = params.get('dateFrom')
    const dateTo = params.get('dateTo')
    const scoped = offers.filter((offer) => {
      const published = datePart(offer)
      return (
        (!categoryName || offer.categoryName === categoryName) &&
        (!currency || offer.currency === currency) &&
        (!employmentType || offer.employmentType === employmentType) &&
        offer.salaryType === salaryType &&
        (!experienceLevel || offer.experienceLevel === experienceLevel) &&
        (!dateFrom || published >= dateFrom) &&
        (!dateTo || published <= dateTo)
      )
    })

    const points = monthKeys(dateFrom, dateTo).map((month) => {
      const monthly = scoped.filter(
        (offer) =>
          datePart(offer).slice(0, 7) === month &&
          (offer.salaryMin != null || offer.salaryMax != null),
      )
      const values = monthly
        .map(comparableSalary)
        .filter(Number.isFinite)
        .sort((left, right) => left - right)

      return {
        month,
        averageSalary:
          values.length > 0
            ? round2(values.reduce((sum, value) => sum + value, 0) / values.length)
            : null,
        medianSalary:
          values.length > 0 ? round2(quantile(values, 0.5)) : null,
        offersCount: values.length,
      }
    })

    send(response, 200, {
      categoryName,
      currency,
      employmentType,
      experienceLevel: experienceLevel || null,
      salaryUnit: scoped[0]?.salaryUnit ?? 'MONTH',
      salaryType,
      points,
    })
    return
  }

  if (path === '/v1.0/analytics/data-completeness') {
    const params = url.searchParams
    const scoped = analyticsScope(params)
    const requestedSources = sourceParams(params)
    const sourceNames =
      requestedSources.length > 0
        ? requestedSources
        : [...new Set(scoped.map((offer) => offer.source))].sort()

    const bySource = sourceNames.map((source) => {
      const sourceOffers = scoped.filter((offer) => offer.source === source)
      const eligibleOfferCount = sourceOffers.length
      const fields = COMPLETENESS_FIELDS.map((field) => {
        const usableOfferCount = sourceOffers.filter((offer) =>
          FIELD_TESTS[field](offer),
        ).length
        return {
          field,
          usableOfferCount,
          unusableOfferCount: eligibleOfferCount - usableOfferCount,
          eligibleOfferCount,
          completenessPercentage: percent(usableOfferCount, eligibleOfferCount),
        }
      })

      return { source, eligibleOfferCount, fields }
    })

    send(response, 200, {
      completenessVersion: 'demo-v1',
      salaryNormalizationVersion: 'demo-v1',
      periodField: 'publishedAt',
      unitOfAnalysis: 'OFFER',
      sources: sourceNames,
      dateFrom: params.get('dateFrom'),
      dateTo: params.get('dateTo'),
      eligibleOfferCount: scoped.length,
      bySource,
    })
    return
  }

  notFound(response, `No mock route for ${path}`)
})

server.listen(8080, () => {
  console.log('mock api listening on http://localhost:8080')
})
