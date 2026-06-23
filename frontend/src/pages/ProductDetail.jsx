import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiArrowLeft, FiStar, FiShoppingCart, FiCheck } from 'react-icons/fi'
import ProductGrid from '../components/ProductGrid'
import { fetchProduct, fetchRecommendations } from '../services/api'

export default function ProductDetail({ onAddToCart }) {
  const { id } = useParams()
  const { t } = useTranslation()

  const [product, setProduct] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [selectedSize, setSelectedSize] = useState('')
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setLoading(true)
    setAdded(false)
    setSelectedSize('')

    Promise.all([
      fetchProduct(id),
      fetchRecommendations(id).catch(() => []),
    ])
      .then(([prod, recs]) => {
        setProduct(prod)
        setRecommendations(recs)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    if (onAddToCart && product) {
      onAddToCart(product._id, 1, selectedSize)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-20 mb-6" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-xl" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product || product.error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">😕</p>
        <p className="text-text-light text-lg">Product not found</p>
        <Link to="/products" className="text-primary mt-4 inline-block">{t('back')}</Link>
      </div>
    )
  }

  const hasImage = product.image_url && !product.image_url.includes('placeholder')

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Link to="/products" className="inline-flex items-center gap-1 text-text-light hover:text-primary text-sm mb-6 no-underline">
        <FiArrowLeft size={16} />
        {t('back')}
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
          {hasImage ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50">
              <span className="text-8xl">👗</span>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-text-light font-medium uppercase tracking-wide">
            {product.brand}
          </p>
          <h1 className="text-2xl font-bold text-text mt-1">{product.name}</h1>

          {product.rating > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <span className="flex items-center gap-1 bg-green-600 text-white text-sm px-2 py-0.5 rounded">
                {product.rating} <FiStar size={12} fill="white" />
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-3xl font-bold text-text">
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
            {product.original_price > product.price && (
              <>
                <span className="text-lg text-text-light line-through">
                  ₹{product.original_price?.toLocaleString('en-IN')}
                </span>
                <span className="text-sm font-bold text-primary">
                  {product.discount}
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="text-text-light text-sm mt-4 leading-relaxed">
              {product.description}
            </p>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-text mb-2">{t('select_size')}</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                      selectedSize === size
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-white text-text hover:border-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={added}
            className={`mt-8 w-full sm:w-auto px-8 py-3 rounded-lg text-sm font-bold border-0 cursor-pointer transition-all flex items-center justify-center gap-2 ${
              added
                ? 'bg-success text-white'
                : 'bg-primary text-white hover:bg-primary-dark hover:shadow-lg'
            }`}
          >
            {added ? (
              <>
                <FiCheck size={18} />
                {t('added_to_cart')}
              </>
            ) : (
              <>
                <FiShoppingCart size={18} />
                {t('add_to_cart')}
              </>
            )}
          </button>

          {product.color && (
            <div className="mt-6 flex items-center gap-2">
              <span className="text-sm text-text-light">Color:</span>
              <span className="text-sm font-medium text-text">{product.color}</span>
            </div>
          )}

          {product.gender && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-text-light">For:</span>
              <span className="text-sm font-medium text-text">{product.gender}</span>
            </div>
          )}
        </div>
      </div>

      {recommendations.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-text mb-6">{t('you_might_like')}</h2>
          <ProductGrid products={recommendations} />
        </section>
      )}
    </div>
  )
}
