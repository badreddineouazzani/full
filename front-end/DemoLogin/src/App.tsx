import { useState, useEffect  } from 'react'
import ProduitCard from './ProduitCard'

interface Category {
  id: number;
  NameCt: string;      // ⚠️ b N kbira — kif jat f JSON dyalek bessbet
}

interface Produit {
  id: number;
  namePr: string;
  category: Category;  // objet mrekkeb, machi string
}

function App() {
  const [search, setSearch] = useState("");   
  const [produits, setProduits] = useState<Produit[]>([]);   // ① bdina khawi
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8080/products")
      .then((res) => {
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
  }, []);   // ③ ← had [] mohimma bzzaf!
const produitsFiltres = produits.filter((p) =>
  (p.namePr ?? "").toLowerCase().includes(search.toLowerCase())
);
  if (loading) return <p>loading... ⏳</p>;
  if (error) return <p>error : {error} ❌</p>;



  return (
    <section id="center">
      <h1>Gestion Produits 🛒</h1>

      <input
        type="text"
        placeholder="product name ..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

     {produitsFiltres.map((p) => (
  <ProduitCard key={p.id} namePr={p.namePr} categoryName={p.category.NameCt} />
))}

      {produitsFiltres.length === 0 && <p>product not exists 🤷</p>}
    </section>
  );
}

export default App;