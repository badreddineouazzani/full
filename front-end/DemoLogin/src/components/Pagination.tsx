import './Pagination.css'

interface PaginationProps {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

// Build a compact list of page numbers with gaps, e.g. [1, 'gap', 4, 5, 6, 'gap', 12].
function pageWindow(page: number, pageCount: number): (number | 'gap')[] {
  const wanted = new Set<number>([1, pageCount, page - 1, page, page + 1])
  const pages = [...wanted].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b)

  const out: (number | 'gap')[] = []
  let prev = 0
  for (const p of pages) {
    if (prev && p - prev > 1) out.push('gap')
    out.push(p)
    prev = p
  }
  return out
}

function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="page-btn"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        ‹
      </button>

      {pageWindow(page, pageCount).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="page-ellipsis">…</span>
        ) : (
          <button
            type="button"
            key={p}
            className={`page-btn${p === page ? ' active' : ''}`}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        className="page-btn"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  )
}

export default Pagination