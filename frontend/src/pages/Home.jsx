import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import VoiceButton from '../components/VoiceButton'
import SearchBar from '../components/SearchBar'
import ChatBubble from '../components/ChatBubble'
import ProductGrid from '../components/ProductGrid'
import useVoiceRecorder from '../hooks/useVoiceRecorder'
import { processVoice, textSearch } from '../services/api'

export default function Home() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { isRecording, audioBlob, error, startRecording, stopRecording, resetRecording } = useVoiceRecorder()

  const [isProcessing, setIsProcessing] = useState(false)
  const [voiceResult, setVoiceResult] = useState(null)
  const [products, setProducts] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  const handleVoiceResult = useCallback(async () => {
    if (!audioBlob) return

    setIsProcessing(true)
    try {
      const result = await processVoice(audioBlob, i18n.language)
      setVoiceResult(result)
      setProducts(result.products || [])
    } catch (err) {
      console.error('Voice processing failed:', err)
      setVoiceResult({
        transcript: '',
        response_text: 'Something went wrong. Please try again.',
        response_audio: '',
      })
    } finally {
      setIsProcessing(false)
      resetRecording()
    }
  }, [audioBlob, i18n.language, resetRecording])

  useEffect(() => {
    if (audioBlob) {
      handleVoiceResult()
    }
  }, [audioBlob, handleVoiceResult])

  const handleTextSearch = async (query) => {
    setSearchLoading(true)
    setVoiceResult(null)
    try {
      const result = await textSearch(query, i18n.language)
      setProducts(result.products || [])
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <section className="text-center py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-text mb-3">
          {t('welcome_title')}
        </h1>
        <p className="text-text-light text-lg mb-8 max-w-md mx-auto">
          {t('welcome_subtitle')}
        </p>

        <VoiceButton
          isRecording={isRecording}
          isProcessing={isProcessing}
          onStart={startRecording}
          onStop={stopRecording}
        />

        {error && (
          <p className="text-red-500 text-sm mt-4">{error}</p>
        )}

        <div className="mt-8">
          <SearchBar onSearch={handleTextSearch} loading={searchLoading} />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <p className="text-sm text-text-light w-full mb-1">{t('try_saying')}:</p>
          {['example_1', 'example_2', 'example_3'].map((key) => (
            <button
              key={key}
              onClick={() => handleTextSearch(t(key))}
              className="px-4 py-2 bg-white rounded-full border border-border text-sm text-text hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              "{t(key)}"
            </button>
          ))}
        </div>
      </section>

      <ChatBubble
        transcript={voiceResult?.transcript}
        responseText={voiceResult?.response_text}
        responseAudio={voiceResult?.response_audio}
        detectedLanguage={voiceResult?.detected_language}
      />

      {products.length > 0 && (
        <section className="mt-6">
          <ProductGrid products={products} loading={searchLoading} />
        </section>
      )}
    </div>
  )
}
