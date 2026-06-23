import { useState, useEffect, useCallback } from 'react'
import { fetchCart, addToCart, removeFromCart, clearCart } from '../services/api'

const SESSION_ID = 'session_' + Math.random().toString(36).substring(2, 10)

export default function useCart() {
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(false)

  const sessionId = typeof window !== 'undefined'
    ? (sessionStorage.getItem('cart_session') || (() => {
        sessionStorage.setItem('cart_session', SESSION_ID)
        return SESSION_ID
      })())
    : SESSION_ID

  const loadCart = useCallback(async () => {
    try {
      const data = await fetchCart(sessionId)
      setCart(data)
    } catch (err) {
      console.error('Failed to load cart:', err)
    }
  }, [sessionId])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  const addItem = useCallback(async (productId, quantity = 1, size = '') => {
    setLoading(true)
    try {
      await addToCart(sessionId, productId, quantity, size)
      await loadCart()
    } catch (err) {
      console.error('Failed to add to cart:', err)
    } finally {
      setLoading(false)
    }
  }, [sessionId, loadCart])

  const removeItem = useCallback(async (productId) => {
    setLoading(true)
    try {
      await removeFromCart(sessionId, productId)
      await loadCart()
    } catch (err) {
      console.error('Failed to remove from cart:', err)
    } finally {
      setLoading(false)
    }
  }, [sessionId, loadCart])

  const clear = useCallback(async () => {
    setLoading(true)
    try {
      await clearCart(sessionId)
      setCart({ items: [], total: 0 })
    } catch (err) {
      console.error('Failed to clear cart:', err)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  return {
    cart,
    loading,
    itemCount: cart.items.length,
    addItem,
    removeItem,
    clearCart: clear,
    refreshCart: loadCart,
  }
}
