import { useState, useEffect, useMemo, useRef } from 'react'
import ProduitCard from './ProduitCard'
import Login from './login'
import AddProduct from './AddProduct'
import './App.css'

interface Category {
  id: number;
  NameCt: string;
}

interface Produit {
  id: number;
  namePr: string;
  category: Category;
}

type SortKey = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest',    label: 'Newest First' },
  { value: 'oldest',   label: 'Oldest First' },
  { value: 'name-asc', label: 'Name A → Z'   },
  { value: 'name-desc',label: 'Name Z → A'   },
];

function App() {
  const [search, setSearch]           = useState("");
  const [searchOpen, setSearchOpen]   = useState(false);
  const [produits, setProduits]       = useState<Produit[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn]   = useState(!!localStorage.getItem("token"));
  const [sortBy, setSortBy]           = useState<SortKey>('newest');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteMode, setDeleteMode]   = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [dark, setDark]               = useState(() => localStorage.getItem("theme") === "dark");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const fetchProduits = () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    fetch("http://localhost:8080/products", {
      headers: { "Authorization": "Bearer " + token },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          throw new Error("Session expired, please log in again.");
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Produit[]) => {
        setProduits(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchProduits();
  }, [isLoggedIn]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSearch(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const closeSearch = () => { setSearchOpen(false); setSearch(""); };

  const exitDeleteMode = () => { setDeleteMode(false); setSelectedIds(new Set()); };

  const categories = useMemo(() => {
    const names = [...new Set(produits.map((p) => p.category?.NameCt).filter(Boolean))];
    return names.sort();
  }, [produits]);

  const displayed = useMemo(() => {
    let list = produits.filter((p) =>
      (p.namePr ?? "").toLowerCase().includes(search.toLowerCase())
    );
    if (categoryFilter !== 'all') {
      list = list.filter((p) => p.category?.NameCt === categoryFilter);
    }
    switch (sortBy) {
      case 'newest':    return [...list].sort((a, b) => b.id - a.id);
      case 'oldest':    return [...list].sort((a, b) => a.id - b.id);
      case 'name-asc':  return [...list].sort((a, b) => a.namePr.localeCompare(b.namePr));
      case 'name-desc': return [...list].sort((a, b) => b.namePr.localeCompare(a.namePr));
    }
  }, [produits, search, sortBy, categoryFilter]);

  const displayedIds = useMemo(() => displayed.map((p) => p.id), [displayed]);
  const allSelected  = displayedIds.length > 0 && displayedIds.every((id) => selectedIds.has(id));

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        displayedIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => new Set([...prev, ...displayedIds]));
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8080/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setProduits((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete: " + (err instanceof Error ? err.message : ""));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const token = localStorage.getItem("token");
    const ids = [...selectedIds];
    try {
      await Promise.all(ids.map((id) =>
        fetch(`http://localhost:8080/products/${id}`, {
          method: "DELETE",
          headers: { "Authorization": "Bearer " + token },
        })
      ));
      setProduits((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      exitDeleteMode();
    } catch (err) {
      alert("Failed to delete some products.");
    }
  };

  if (!isLoggedIn) return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  if (loading)     return <p>Loading... ⏳</p>;
  if (error)       return <p>Error: {error} ❌</p>;

  return (
    <section id="center">
      <div className="page-header">
        <div className="header-controls">
          <button className="theme-toggle" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
            {dark ? (
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <button
            className="logout-button"
            onClick={() => { localStorage.removeItem("token"); setIsLoggedIn(false); }}
          >
            <span className="logout-icon">↩</span>
            Logout
          </button>
        </div>
        <h1>Product Management 🛒</h1>
      </div>

      <div className="main-layout">
        <aside className="sidebar">
          <div className="sidebar-section">
            <span className="filter-label">Sort by</span>
            <div className="filter-pills-col">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`filter-pill${sortBy === opt.value ? ' active' : ''}`}
                  onClick={() => setSortBy(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {categories.length > 0 && (
            <div className="sidebar-section">
              <span className="filter-label">Category</span>
              <div className="filter-pills-col">
                <button
                  className={`filter-pill${categoryFilter === 'all' ? ' active' : ''}`}
                  onClick={() => setCategoryFilter('all')}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`filter-pill${categoryFilter === cat ? ' active' : ''}`}
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        <div className="content">
          {/* Content header */}
          <div className="content-header">
            {deleteMode ? (
              <>
                <label className="select-all-label">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                  />
                  <span>Select all ({displayedIds.length})</span>
                </label>
                <div className="content-header-actions">
                  {selectedIds.size > 0 && (
                    <button className="delete-selected-btn" onClick={handleDeleteSelected}>
                      Delete ({selectedIds.size})
                    </button>
                  )}
                  <button className="cancel-delete-btn" onClick={exitDeleteMode}>
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
                  <AddProduct onProductAdded={fetchProduits} />
                  <button className="delete-mode-btn" onClick={() => setDeleteMode(true)}>
                    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 5h14M8 5V3h4v2M6 5l1 11h6l1-11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Delete
                  </button>
                  {/* Inline search */}
                  <div className={`inline-search${searchOpen ? ' open' : ''}`}>
                    <div className="inline-search-bar">
                      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.7"/>
                        <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                      </svg>
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      {search && (
                        <button className="spotlight-clear" onClick={() => setSearch("")}>✕</button>
                      )}
                    </div>
                    <button
                      className={`search-icon-btn${searchOpen ? ' active' : ''}`}
                      onClick={() => searchOpen ? closeSearch() : setSearchOpen(true)}
                      aria-label="Toggle search"
                    >
                      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.7"/>
                        <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Product grid */}
          <div className="product-grid">
            {displayed.map((p) => (
              <ProduitCard
                key={p.id}
                namePr={p.namePr}
                categoryName={p.category?.NameCt ?? "—"}
                onDelete={() => handleDelete(p.id)}
                deleteMode={deleteMode}
                selected={selectedIds.has(p.id)}
                onToggleSelect={() => toggleSelect(p.id)}
              />
            ))}
          </div>
          {displayed.length === 0 && <p className="empty-state">No products found 🤷</p>}
        </div>
      </div>
    </section>
  );
}

export default App;
