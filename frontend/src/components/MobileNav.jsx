import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiHome, FiShoppingBag, FiShoppingCart, FiMic } from 'react-icons/fi'

export default function MobileNav({ cartCount = 0 }) {
  const { t } = useTranslation()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const items = [
    { path: '/', icon: FiHome, label: t('home') },
    { path: '/products', icon: FiShoppingBag, label: t('products') },
    { path: '/cart', icon: FiShoppingCart, label: t('cart'), badge: cartCount },
  ]

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1 no-underline transition-colors ${
                isActive(item.path) ? 'text-primary' : 'text-text-light'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px]">{item.label}</span>
              {item.badge > 0 && (
                <span className="absolute -top-0.5 right-0.5 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
