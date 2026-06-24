import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { editRequest, type Produit } from '../features/products/productsSlice'

interface EditProductProps {
  product: Produit
  onClose: () => void
}

function EditProduct({ product, onClose }: EditProductProps) {
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((s) => s.products)
  const [namePr, setNamePr] = useState(product.namePr)
  const [categoryId, setCategoryId] = useState(product.category ? String(product.category.id) : '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(editRequest({ id: product.id, namePr, categoryId: Number(categoryId) }))
  }

  return (
    <div className="modal-overlay" onClick={() => !loading && onClose()}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Product</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close" disabled={loading}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="add-product-field">
            <span>Product Name</span>
            <input
              type="text"
              placeholder="Enter product name"
              value={namePr}
              onChange={(e) => setNamePr(e.target.value)}
              required
              autoFocus
            />
          </label>

          <label className="add-product-field">
            <span>Category ID</span>
            <input
              type="number"
              placeholder="Enter category ID"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              min={1}
            />
          </label>

          {error && <p className="add-product-error">⚠ {error}</p>}

          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="add-product-button" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProduct
