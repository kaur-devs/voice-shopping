import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiGlobe, FiChevronDown } from 'react-icons/fi'
import { LANGUAGES } from '../i18n/i18n'

export default function LanguageSelector() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0]

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-border bg-white text-sm text-text hover:border-primary transition-colors cursor-pointer"
      >
        <FiGlobe size={16} />
        <span className="hidden sm:inline">{currentLang.native}</span>
        <FiChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-border py-1 z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code)
                setOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between ${
                lang.code === i18n.language ? 'text-primary font-medium bg-pink-50' : 'text-text'
              }`}
            >
              <span>{lang.native}</span>
              <span className="text-text-light text-xs">{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
