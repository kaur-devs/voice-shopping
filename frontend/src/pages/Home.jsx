import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import VoiceButton from '../components/VoiceButton'
import SearchBar from '../components/SearchBar'
import ChatBubble from '../components/ChatBubble'
import ProductGrid from '../components/ProductGrid'
import useVoiceRecorder from '../hooks/useVoiceRecorder'
import { processVoice, textSearch } from '../services/api'

export default function Home() {
  const { t, i18n } = useTranslation()
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
      <section className="text-center py-8 sm:py-16 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-50 rounded-full text-primary text-sm font-medium mb-6">
          <span>🎙️</span>
          <span>8 Indian Languages Supported</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold text-text mb-3 leading-tight">
          {t('welcome_title')}
        </h1>
        <p className="text-text-light text-base sm:text-lg mb-10 max-w-lg mx-auto">
          {t('welcome_subtitle')}
        </p>

        <VoiceButton
          isRecording={isRecording}
          isProcessing={isProcessing}
          onStart={startRecording}
          onStop={stopRecording}
        />

        {error && (
          <p className="text-red-500 text-sm mt-4 animate-fade-in-up">{error}</p>
        )}

        <div className="mt-10">
          <SearchBar onSearch={handleTextSearch} loading={searchLoading} />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <p className="text-sm text-text-light w-full mb-2">{t('try_saying')}:</p>
          {['example_1', 'example_2', 'example_3'].map((key) => (
            <button
              key={key}
              onClick={() => handleTextSearch(t(key))}
              className="px-4 py-2 bg-white rounded-full border border-border text-sm text-text hover:border-primary hover:text-primary hover:shadow-sm transition-all cursor-pointer active:scale-95"
            >
              &ldquo;{t(key)}&rdquo;
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
        <section className="mt-8 pb-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text">
              {voiceResult?.intent?.product_type
                ? `Results for "${voiceResult.intent.product_type}"`
                : 'Search Results'}
            </h2>
            <span className="text-sm text-text-light">{products.length} items</span>
          </div>
          <ProductGrid products={products} loading={searchLoading} />
        </section>
      )}

      {products.length === 0 && !voiceResult && (
        <section className="py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: '🎤', title: 'Voice Search', desc: 'Speak in your language to find products' },
              { icon: '🌐', title: '8 Languages', desc: 'Hindi, Tamil, Telugu, Kannada & more' },
              { icon: '🤖', title: 'Smart AI', desc: 'Understands colors, sizes & price ranges' },
            ].map((feature) => (
              <div key={feature.title} className="text-center p-6 bg-white rounded-xl border border-border">
                <p className="text-3xl mb-3">{feature.icon}</p>
                <h3 className="font-bold text-text text-sm mb-1">{feature.title}</h3>
                <p className="text-text-light text-xs">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
