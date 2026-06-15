import { useState } from 'react'

interface AddProductProps {
  onProductAdded: () => void;
}

function AddProduct({ onProductAdded }: AddProductProps) {
  const [open, setOpen] = useState(false);
  const [namePr, setNamePr] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8080/products", {
        method: "POST",
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
      setNamePr("");
      setCategoryId("");
      setSuccess(true);
      onProductAdded();
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
    setNamePr("");
    setCategoryId("");
    setError(null);
    setSuccess(false);
  };

  return (
    <>
      <button className="add-product-trigger" onClick={() => setOpen(true)}>
        <span>＋</span>
        Add Product
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
                  {loading ? "Adding..." : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AddProduct;