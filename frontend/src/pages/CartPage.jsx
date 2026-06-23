import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiTrash2, FiShoppingBag, FiArrowLeft } from 'react-icons/fi'

export default function CartPage({ cart, onRemove, onClear, loading }) {
  const { t } = useTranslation()

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-6xl mb-4">🛒</p>
        <p className="text-text-light text-xl mb-6">{t('empty_cart')}</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg no-underline font-medium hover:bg-primary-dark transition-colors"
        >
          <FiShoppingBag size={18} />
          {t('products')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link to="/products" className="inline-flex items-center gap-1 text-text-light hover:text-primary text-sm mb-6 no-underline">
        <FiArrowLeft size={16} />
        Continue Shopping
      </Link>

      <h1 className="text-2xl font-bold text-text mb-6">{t('cart')}</h1>

      <div className="space-y-4">
        {cart.items.map((item) => (
          <div
            key={item.product._id}
            className="flex gap-4 bg-white rounded-xl p-4 shadow-sm border border-border"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
              {item.product.image_url ? (
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50">
                  <span className="text-2xl">👗</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-light uppercase">{item.product.brand}</p>
              <h3 className="text-sm font-medium text-text truncate">{item.product.name}</h3>
              {item.size && (
                <p className="text-xs text-text-light mt-1">Size: {item.size}</p>
              )}
              <p className="text-xs text-text-light mt-1">Qty: {item.quantity}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-text">
                  ₹{item.subtotal?.toLocaleString('en-IN')}
                </span>
                <button
                  onClick={() => onRemove(item.product._id)}
                  disabled={loading}
                  className="text-red-400 hover:text-red-600 cursor-pointer bg-transparent border-0 p-1 transition-colors"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-medium text-text">{t('total')}</span>
          <span className="text-2xl font-bold text-text">
            ₹{cart.total?.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClear}
            disabled={loading}
            className="px-4 py-3 rounded-lg border border-border text-sm text-text-light cursor-pointer hover:border-red-300 hover:text-red-500 transition-colors bg-white"
          >
            {t('clear_cart')}
          </button>
          <button className="flex-1 px-6 py-3 bg-primary text-white rounded-lg text-sm font-bold cursor-pointer hover:bg-primary-dark transition-colors border-0">
            {t('checkout')} →
          </button>
        </div>
      </div>
    </div>
  )
}
