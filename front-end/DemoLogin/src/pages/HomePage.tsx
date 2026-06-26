import { useEffect, useMemo, useRef, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  fetchRequest, setSortBy, setCategoryFilter, setSearch,
  setEditingProduct, setDeleteMode,
  toggleSelected, setSelectedIds, deleteRequest, deleteManyRequest,
  type SortKey,
} from '../features/products/productsSlice'
import { logout } from '../features/auth/authSlice'
import ProduitCard from '../components/ProduitCard'
import AddProduct from '../components/AddProduct'
import EditProduct from '../components/EditProduct'
import Pagination from '../components/Pagination'
import { useLocale, type Locale } from '../services/i18n'
import { useCurrentUser } from '../services/auth/useCurrentUser'
import '../App.css'

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
]

const SORT_OPTIONS: { value: SortKey; labelId: string }[] = [
  { value: 'newest',    labelId: 'sort.newest'  },
  { value: 'oldest',    labelId: 'sort.oldest'  },
  { value: 'name-asc',  labelId: 'sort.nameAsc' },
  { value: 'name-desc', labelId: 'sort.nameDesc'},
]

interface HomePageProps {
  onLoggedOut: () => void
  onOpenAdmin: () => void
}

function HomePage({ onLoggedOut, onOpenAdmin }: HomePageProps) {
  const dispatch = useAppDispatch()
  const intl = useIntl()
  const { locale, setLocale } = useLocale()
  const { can, hasRole } = useCurrentUser()

  const {
    items, loading, error, sortBy, categoryFilter, search,
    editingProduct, deleteMode, selectedIds,
  } = useAppSelector((s) => s.products)

  const { token } = useAppSelector((s) => s.auth)

  const [searchOpen, setSearchOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const [page, setPage] = useState(1)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const canAdd    = can('canAdd')
  const canEdit   = can('canEdit')
  const canDelete = can('canDelete')

  // Log out when the token is cleared by the saga (401 handling)
  useEffect(() => {
    if (!token) onLoggedOut()
  }, [token, onLoggedOut])

  useEffect(() => {
    dispatch(fetchRequest())
  }, [dispatch])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 100)
  }, [searchOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSearch() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const closeSearch = () => { setSearchOpen(false); dispatch(setSearch('')) }

  const categories = useMemo(() => {
    const names = [...new Set(items.map((p) => p.category?.NameCt).filter(Boolean))]
    return (names as string[]).sort()
  }, [items])

  const displayed = useMemo(() => {
    let list = items.filter((p) =>
      (p.namePr ?? '').toLowerCase().includes(search.toLowerCase())
    )
    if (categoryFilter !== 'all') list = list.filter((p) => p.category?.NameCt === categoryFilter)
    switch (sortBy) {
      case 'newest':    return [...list].sort((a, b) => b.id - a.id)
      case 'oldest':    return [...list].sort((a, b) => a.id - b.id)
      case 'name-asc':  return [...list].sort((a, b) => a.namePr.localeCompare(b.namePr))
      case 'name-desc': return [...list].sort((a, b) => b.namePr.localeCompare(a.namePr))
    }
  }, [items, search, sortBy, categoryFilter])

  // Reset to the first page whenever the filtered result set changes.
  useEffect(() => { setPage(1) }, [search, sortBy, categoryFilter])

  const PRODUCTS_PER_PAGE = 12
  const pageCount = Math.max(1, Math.ceil(displayed.length / PRODUCTS_PER_PAGE))
  const currentPage = Math.min(page, pageCount)
  const visibleProducts = useMemo(
    () => displayed.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE),
    [displayed, currentPage]
  )
  const displayedIds    = useMemo(() => displayed.map((p) => p.id), [displayed])
  const selectedSet     = useMemo(() => new Set(selectedIds), [selectedIds])
  const allSelected     = displayedIds.length > 0 && displayedIds.every((id) => selectedSet.has(id))

  const toggleSelectAll = () => {
    if (allSelected) dispatch(setSelectedIds(selectedIds.filter((id) => !displayedIds.includes(id))))
    else dispatch(setSelectedIds([...new Set([...selectedIds, ...displayedIds])]))
  }

  const handleLogout = () => { dispatch(logout()); onLoggedOut() }

  if (loading && items.length === 0) return <p>Loading... ⏳</p>
  if (error) return <p>Error: {error} ❌</p>

  return (
    <section id="center">
      <div className="page-header">
        <h1><FormattedMessage id="common.appName" /> 🛒</h1>
        <div className="header-controls">
          <select
            className="locale-select"
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            aria-label="Language"
          >
            {LOCALE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button className="theme-toggle" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
            {dark ? (
              <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </button>
          {hasRole('superadmin') && (
            <button className="logout-button" onClick={onOpenAdmin}>
              <span className="logout-icon">🛡️</span>
              <FormattedMessage id="admin.title" />
            </button>
          )}
          <button className="logout-button" onClick={handleLogout}>
            <span className="logout-icon">↩</span>
            <FormattedMessage id="common.logout" />
          </button>
        </div>
      </div>

      <div className="main-layout">
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

        <div className="content">
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
                  {displayed.length} product{displayed.length !== 1 ? 's' : ''}
                </span>
                <div className="content-header-actions">
                  {canAdd && <AddProduct />}
                  {canDelete && (
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

          <div className="product-grid">
            {visibleProducts.map((p) => (
              <ProduitCard
                key={p.id}
                namePr={p.namePr}
                categoryName={p.category?.NameCt ?? '—'}
                onDelete={() => dispatch(deleteRequest(p.id))}
                onEdit={() => dispatch(setEditingProduct(p))}
                canEdit={canEdit}
                canDelete={canDelete}
                deleteMode={deleteMode}
                selected={selectedSet.has(p.id)}
                onToggleSelect={() => dispatch(toggleSelected(p.id))}
              />
            ))}
          </div>
          {displayed.length === 0 && (
            <p className="empty-state"><FormattedMessage id="productList.noResults" /> 🤷</p>
          )}
          <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
        </div>
      </div>

      {editingProduct && (
        <EditProduct
          product={editingProduct}
          onClose={() => dispatch(setEditingProduct(null))}
        />
      )}
    </section>
  )
}

export default HomePage
