import { useState } from 'react'

interface EditProductProps {
  product: { id: number; namePr: string; category: { id: number; NameCt: string } | null };
  onClose: () => void;
  onUpdated: () => void;
}

function EditProduct({ product, onClose, onUpdated }: EditProductProps) {
  const [namePr, setNamePr] = useState(product.namePr);
  const [categoryId, setCategoryId] = useState(product.category ? String(product.category.id) : "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8080/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
        body: JSON.stringify({
          namePr,
          category: { id: Number(categoryId) },
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

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
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;
