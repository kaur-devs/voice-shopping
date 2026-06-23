import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiHome, FiShoppingBag, FiShoppingCart } from 'react-icons/fi'
import LanguageSelector from './LanguageSelector'

export default function Navbar({ cartCount = 0 }) {
  const { t } = useTranslation()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="text-xl font-bold text-primary">{t('app_name')}</span>
            <span className="text-xs text-text-light hidden sm:inline">{t('tagline')}</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-4">
            <LanguageSelector />

            <Link
              to="/"
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm no-underline transition-colors ${
                isActive('/') ? 'text-primary bg-pink-50' : 'text-text-light hover:text-text'
              }`}
            >
              <FiHome size={18} />
              <span className="hidden sm:inline">{t('home')}</span>
            </Link>

            <Link
              to="/products"
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm no-underline transition-colors ${
                isActive('/products') ? 'text-primary bg-pink-50' : 'text-text-light hover:text-text'
              }`}
            >
              <FiShoppingBag size={18} />
              <span className="hidden sm:inline">{t('products')}</span>
            </Link>

            <Link
              to="/cart"
              className={`relative flex items-center gap-1 px-3 py-2 rounded-lg text-sm no-underline transition-colors ${
                isActive('/cart') ? 'text-primary bg-pink-50' : 'text-text-light hover:text-text'
              }`}
            >
              <FiShoppingCart size={18} />
              <span className="hidden sm:inline">{t('cart')}</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
