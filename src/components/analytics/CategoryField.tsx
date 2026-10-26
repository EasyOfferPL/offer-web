import type { CategoryTO } from '../../api/types'
import { humanize } from '../../lib/format'

interface CategoryFieldProps {
  categories: CategoryTO[]
  defaultValue?: string
  label?: string
  name?: string
  required?: boolean
}

/** Optional single-category scope, sourced from GET /v1.0/categories. */
export function CategoryField({
  categories,
  defaultValue = '',
  label = 'Category',
  name = 'categoryName',
  required = false,
}: CategoryFieldProps) {
  const hasSelectedCategory =
    defaultValue.length > 0 &&
    !categories.some((category) => category.categoryName === defaultValue)

  return (
    <label className="field">
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue} required={required}>
        <option value="">{required ? 'Choose a category' : 'All categories'}</option>
        {hasSelectedCategory ? (
          <option value={defaultValue}>{humanize(defaultValue)}</option>
        ) : null}
        {categories.map((category) => (
          <option key={category.categoryName} value={category.categoryName}>
            {humanize(category.categoryName)}
          </option>
        ))}
      </select>
    </label>
  )
}
