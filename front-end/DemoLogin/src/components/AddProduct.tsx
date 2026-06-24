import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { addRequest } from '../features/products/productsSlice'

function AddProduct() {
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((s) => s.products)

  const [open, setOpen] = useState(false)
  const [namePr, setNamePr] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [success, setSuccess] = useState(false)
  const [prevLoading, setPrevLoading] = useState(false)

  // Detect when a loading→idle transition happened without error = success
  useEffect(() => {
    if (prevLoading && !loading && !error && open) {
      setSuccess(true)
      setNamePr('')
      setCategoryId('')
      setTimeout(() => { setSuccess(false); setOpen(false) }, 1200)
    }
    setPrevLoading(loading)
  }, [loading, error, open, prevLoading])

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(addRequest({ namePr, categoryId: Number(categoryId) }))
  }

  const handleClose = () => {
    if (loading) return
    setOpen(false)
    setNamePr('')
    setCategoryId('')
    setSuccess(false)
  }

  return (
    <>
      <button className="add-product-trigger" onClick={() => setOpen(true)}>
        <span>＋</span>Add Product
      </button>

      {open && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button className="modal-close" onClick={handleClose} aria-label="Close">✕</button>
            </div>

            <form className="modal-form" onSubmit={handleAdd}>
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
              {success && <p className="add-product-success">✓ Product added successfully!</p>}

              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={handleClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="add-product-button" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default AddProduct
