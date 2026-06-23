import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './en.json'
import hi from './hi.json'
import ta from './ta.json'
import te from './te.json'
import kn from './kn.json'
import bn from './bn.json'
import mr from './mr.json'
import gu from './gu.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    ta: { translation: ta },
    te: { translation: te },
    kn: { translation: kn },
    bn: { translation: bn },
    mr: { translation: mr },
    gu: { translation: gu },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
]

export default i18n
