import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ApiError } from '../../api/errors'
import type { SalaryStatisticTO } from '../../api/types'
import { ErrorState } from '../AsyncStates'
import { BarChart } from './BarChart'
import { SalaryCard } from './SalaryCard'

const statistic: SalaryStatisticTO = {
  groupValue: 'SENIOR',
  currency: 'PLN',
  salaryUnit: 'MONTH',
  employmentType: 'B2B',
  salaryType: 'GROSS',
  minimumSalary: 12000,
  percentile25Salary: 14000,
  averageSalary: 16000,
  medianSalary: 15500,
  percentile75Salary: 18000,
  maximumSalary: 22000,
  offersCount: 12,
  meetsRecommendedSampleSize: false,
}

describe('SalaryCard', () => {
  it('shows the group context and the exploratory sample warning', () => {
    const html = renderToStaticMarkup(
      <SalaryCard statistic={statistic} recommendedMinimumSampleSize={30} />,
    )

    expect(html).toContain('Senior')
    expect(html).toContain('Median')
    expect(html).toContain('15,500')
    expect(html).toContain('PLN / month')
    expect(html).toContain('PLN · MONTH · B2B · Gross')
    expect(html).toContain('Exploratory')
    expect(html).toContain('Fewer than 30 offers')
  })

  it('marks a group that meets the recommended sample size', () => {
    const html = renderToStaticMarkup(
      <SalaryCard
        statistic={{
          ...statistic,
          offersCount: 30,
          meetsRecommendedSampleSize: true,
        }}
        recommendedMinimumSampleSize={30}
      />,
    )

    expect(html).toContain('Adequate sample')
    expect(html).toContain('recommended minimum of 30')
    expect(html).not.toContain('Exploratory')
  })
})

describe('BarChart', () => {
  it('renders exact values and preserves a zero point in the decorative plot', () => {
    const html = renderToStaticMarkup(
      <BarChart
        points={[
          { key: '2026-01', label: 'Jan 26', value: 0, display: '0' },
          { key: '2026-02', label: 'Feb 26', value: 10, display: '10' },
        ]}
        caption="Exact values are in the table."
      />,
    )

    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('height:1.5%')
    expect(html).toContain('height:100%')
    expect(html).toContain('Exact values are in the table.')
    expect(html).toContain('Feb 26')
  })
})

describe('ErrorState', () => {
  it('renders the API message and every detail', () => {
    const html = renderToStaticMarkup(
      <ErrorState
        error={new ApiError(400, 'Invalid request', ['dateFrom is required', 'size too large'])}
        onRetry={() => undefined}
      />,
    )

    expect(html).toContain('role="alert"')
    expect(html).toContain('Invalid request')
    expect(html).toContain('dateFrom is required')
    expect(html).toContain('size too large')
    expect(html).toContain('Try again')
  })
})
