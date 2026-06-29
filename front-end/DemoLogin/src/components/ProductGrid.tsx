import { FormattedMessage } from 'react-intl'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  setEditingProduct, deleteRequest, toggleSelected,
} from '../features/products/productsSlice'
import { useCurrentUser } from '../services/auth/useCurrentUser'
import { useDisplayedProducts } from '../hooks/useDisplayedProducts'
import { usePagination } from '../hooks/usePagination'
import ProduitCard from './ProduitCard'
import Pagination from './Pagination'

const PRODUCTS_PER_PAGE = 12

/** Paginated card grid for the filtered product list, with empty state. */
function ProductGrid() {
  const dispatch = useAppDispatch()
  const { can } = useCurrentUser()
  const { search, sortBy, categoryFilter, selectedIds, deleteMode } = useAppSelector((s) => s.products)

  const displayed = useDisplayedProducts()
  const { page, pageCount, pageItems, setPage } =
    usePagination(displayed, PRODUCTS_PER_PAGE, `${search}|${sortBy}|${categoryFilter}`)

  const canEdit = can('canEdit')
  const canDelete = can('canDelete')
  const selectedSet = new Set(selectedIds)

  return (
    <>
      <div className="product-grid">
        {pageItems.map((p) => (
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
      <Pagination page={page} pageCount={pageCount} onChange={setPage} />
    </>
  )
}

export default ProductGrid
