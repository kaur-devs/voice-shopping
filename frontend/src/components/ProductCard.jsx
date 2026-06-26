import { Link } from 'react-router-dom'
import { FiStar } from 'react-icons/fi'

export default function ProductCard({ product }) {
  const hasImage = product.image_url && !product.image_url.includes('placeholder')

  return (
    <Link
      to={`/product/${product._id}`}
      className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 no-underline border border-transparent hover:border-primary/20 hover:-translate-y-1"
    >
      <div className="aspect-[3/4] bg-gray-50 overflow-hidden relative">
        {hasImage ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50">
            <span className="text-4xl">👗</span>
          </div>
        )}

        {product.discount && (
          <span className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
            {product.discount}
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="text-[11px] text-text-light font-medium uppercase tracking-wider truncate">
          {product.brand}
        </p>
        <h3 className="text-sm text-text font-medium mt-1 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-bold text-text">
            ₹{product.price?.toLocaleString('en-IN')}
          </span>
          {product.original_price > product.price && (
            <span className="text-xs text-text-light line-through">
              ₹{product.original_price?.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {product.rating > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <span className="flex items-center gap-0.5 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-md">
              {product.rating} <FiStar size={10} fill="white" />
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
