import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchRequest, setEditingProduct } from '../features/products/productsSlice'
import HomeHeader from '../components/HomeHeader'
import ProductFilters from '../components/ProductFilters'
import ProductToolbar from '../components/ProductToolbar'
import ProductGrid from '../components/ProductGrid'
import EditProduct from '../components/EditProduct'
import '../App.css'

function HomePage() {
  const dispatch = useAppDispatch()
  const { items, loading, error, editingProduct } = useAppSelector((s) => s.products)

  useEffect(() => {
    dispatch(fetchRequest())
  }, [dispatch])

  if (loading && items.length === 0) return <p>Loading... ⏳</p>
  if (error) return <p>Error: {error} ❌</p>

  return (
    <section id="center">
      <HomeHeader />

      <div className="main-layout">
        <ProductFilters />
        <div className="content">
          <ProductToolbar />
          <ProductGrid />
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
