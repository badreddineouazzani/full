import { FormattedMessage } from 'react-intl'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setSortBy, setCategoryFilter, type SortKey } from '../features/products/productsSlice'

const SORT_OPTIONS: { value: SortKey; labelId: string }[] = [
  { value: 'newest',    labelId: 'sort.newest'  },
  { value: 'oldest',    labelId: 'sort.oldest'  },
  { value: 'name-asc',  labelId: 'sort.nameAsc' },
  { value: 'name-desc', labelId: 'sort.nameDesc'},
]

/** Sidebar: sort options + the category facet derived from the loaded products. */
function ProductFilters() {
  const dispatch = useAppDispatch()
  const { items, sortBy, categoryFilter } = useAppSelector((s) => s.products)

  const names = [...new Set(items.map((p) => p.category?.NameCt).filter(Boolean))]
  const categories = (names as string[]).sort()

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <span className="filter-label"><FormattedMessage id="sidebar.sortBy" /></span>
        <div className="filter-pills-col">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`filter-pill${sortBy === opt.value ? ' active' : ''}`}
              onClick={() => dispatch(setSortBy(opt.value))}
            >
              <FormattedMessage id={opt.labelId} />
            </button>
          ))}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="sidebar-section">
          <span className="filter-label"><FormattedMessage id="sidebar.category" /></span>
          <div className="filter-pills-col">
            <button
              className={`filter-pill${categoryFilter === 'all' ? ' active' : ''}`}
              onClick={() => dispatch(setCategoryFilter('all'))}
            >
              <FormattedMessage id="sidebar.all" />
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-pill${categoryFilter === cat ? ' active' : ''}`}
                onClick={() => dispatch(setCategoryFilter(cat))}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}

export default ProductFilters
