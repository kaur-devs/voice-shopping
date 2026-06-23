import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiSearch } from 'react-icons/fi'

export default function SearchBar({ onSearch, loading = false }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="flex items-center bg-white rounded-full border border-border shadow-sm overflow-hidden focus-within:border-primary focus-within:shadow-md transition-all">
        <FiSearch size={20} className="text-text-light ml-4 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search_placeholder')}
          className="flex-1 px-3 py-3 border-0 outline-none bg-transparent text-text text-sm placeholder:text-text-light"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-3 bg-primary text-white text-sm font-medium border-0 cursor-pointer hover:bg-primary-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {t('filter')}
        </button>
      </div>
    </form>
  )
}
