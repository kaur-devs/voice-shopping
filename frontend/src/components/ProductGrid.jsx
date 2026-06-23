import { useTranslation } from 'react-i18next'
import ProductCard from './ProductCard'

export default function ProductGrid({ products, loading = false }) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl overflow-hidden shadow-sm animate-pulse">
            <div className="aspect-[3/4] bg-gray-200" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-text-light text-lg">{t('no_results')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}
