import { useIntl } from 'react-intl'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  setSearch, setDeleteMode, setSelectedIds, deleteManyRequest,
} from '../features/products/productsSlice'
import { useCurrentUser } from '../services/auth/useCurrentUser'
import { useInlineSearch } from '../hooks/useInlineSearch'
import { useDisplayedProducts } from '../hooks/useDisplayedProducts'
import AddProduct from './AddProduct'

/** Header row above the grid: product count / bulk-delete controls + search. */
function ProductToolbar() {
  const dispatch = useAppDispatch()
  const intl = useIntl()
  const { can } = useCurrentUser()
  const { deleteMode, selectedIds, search } = useAppSelector((s) => s.products)
  const {
    open: searchOpen, setOpen: setSearchOpen, close: closeSearch, inputRef: searchInputRef,
  } = useInlineSearch(() => dispatch(setSearch('')))

  const displayedIds = useDisplayedProducts().map((p) => p.id)
  const selectedSet = new Set(selectedIds)
  const allSelected = displayedIds.length > 0 && displayedIds.every((id) => selectedSet.has(id))

  const toggleSelectAll = () => {
    if (allSelected) dispatch(setSelectedIds(selectedIds.filter((id) => !displayedIds.includes(id))))
    else dispatch(setSelectedIds([...new Set([...selectedIds, ...displayedIds])]))
  }

  return (
    <div className="content-header">
      {deleteMode ? (
        <>
          <label className="select-all-label">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
            <span>Select all ({displayedIds.length})</span>
          </label>
          <div className="content-header-actions">
            {selectedIds.length > 0 && (
              <button className="delete-selected-btn" onClick={() => dispatch(deleteManyRequest(selectedIds))}>
                Delete ({selectedIds.length})
              </button>
            )}
            <button className="cancel-delete-btn" onClick={() => dispatch(setDeleteMode(false))}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <span className="product-count">
            {displayedIds.length} product{displayedIds.length !== 1 ? 's' : ''}
          </span>
          <div className="content-header-actions">
            {can('canAdd') && <AddProduct />}
            {can('canDelete') && (
              <button className="delete-mode-btn" onClick={() => dispatch(setDeleteMode(true))}>
                <svg viewBox="0 0 20 20" fill="none"><path d="M3 5h14M8 5V3h4v2M6 5l1 11h6l1-11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Delete
              </button>
            )}
            <div className={`inline-search${searchOpen ? ' open' : ''}`}>
              <div className="inline-search-bar">
                <svg viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.7"/><path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={intl.formatMessage({ id: 'productList.searchPlaceholder' })}
                  value={search}
                  onChange={(e) => dispatch(setSearch(e.target.value))}
                />
                {search && <button className="spotlight-clear" onClick={() => dispatch(setSearch(''))}>✕</button>}
              </div>
              <button
                className={`search-icon-btn${searchOpen ? ' active' : ''}`}
                onClick={() => searchOpen ? closeSearch() : setSearchOpen(true)}
                aria-label="Toggle search"
              >
                <svg viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.7"/><path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ProductToolbar
