import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import CartPage from './pages/CartPage'
import useCart from './hooks/useCart'

function App() {
  const { cart, itemCount, addItem, removeItem, clearCart, loading } = useCart()

  return (
    <div className="min-h-dvh bg-bg">
      <Navbar cartCount={itemCount} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route
          path="/product/:id"
          element={<ProductDetail onAddToCart={addItem} />}
        />
        <Route
          path="/cart"
          element={
            <CartPage
              cart={cart}
              onRemove={removeItem}
              onClear={clearCart}
              loading={loading}
            />
          }
        />
      </Routes>
    </div>
  )
}

export default App
