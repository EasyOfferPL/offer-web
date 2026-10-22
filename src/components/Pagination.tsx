interface PaginationProps {
  page: number
  totalPages: number
  first: boolean
  last: boolean
  onChange: (page: number) => void
}

export function Pagination({ page, totalPages, first, last, onChange }: PaginationProps) {
  const lastPage = Math.max(totalPages - 1, 0)

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => onChange(0)}
        disabled={first}
      >
        First
      </button>
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => onChange(page - 1)}
        disabled={first}
      >
        Previous
      </button>

      <span className="pagination__status">
        Page {page + 1} of {Math.max(totalPages, 1)}
      </span>

      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => onChange(page + 1)}
        disabled={last}
      >
        Next
      </button>
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => onChange(lastPage)}
        disabled={last}
      >
        Last
      </button>
    </nav>
  )
}
