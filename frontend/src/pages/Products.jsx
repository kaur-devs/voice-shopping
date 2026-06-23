import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import ProductGrid from '../components/ProductGrid'
import SearchBar from '../components/SearchBar'
import { fetchProducts, fetchCategories } from '../services/api'

export default function Products() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const activeCategory = searchParams.get('category') || ''
  const activeGender = searchParams.get('gender') || ''
  const searchQuery = searchParams.get('search') || ''

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error)
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchProducts({
      page,
      limit: 20,
      category: activeCategory,
      gender: activeGender,
      search: searchQuery,
    })
      .then((data) => {
        setProducts(data.products)
        setTotalPages(data.pages)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, activeCategory, activeGender, searchQuery])

  const handleSearch = (query) => {
    setSearchParams({ search: query })
    setPage(1)
  }

  const setFilter = (key, value) => {
    const params = Object.fromEntries(searchParams)
    if (value) {
      params[key] = value
    } else {
      delete params[key]
    }
    setSearchParams(params)
    setPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('category', '')}
          className={`px-4 py-1.5 rounded-full text-sm border cursor-pointer transition-colors ${
            !activeCategory
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-text border-border hover:border-primary'
          }`}
        >
          {t('all_categories')}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter('category', cat)}
            className={`px-4 py-1.5 rounded-full text-sm border cursor-pointer transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-text border-border hover:border-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {['Men', 'Women', 'Kids'].map((g) => (
          <button
            key={g}
            onClick={() => setFilter('gender', activeGender === g ? '' : g)}
            className={`px-4 py-1.5 rounded-full text-sm border cursor-pointer transition-colors ${
              activeGender === g
                ? 'bg-text text-white border-text'
                : 'bg-white text-text border-border hover:border-text'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <ProductGrid products={products} loading={loading} />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-border bg-white text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary transition-colors"
          >
            Previous
          </button>
          <span className="flex items-center px-4 text-sm text-text-light">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-border bg-white text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
