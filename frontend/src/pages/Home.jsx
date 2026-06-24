import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FiMic, FiMicOff, FiSend, FiStar, FiVolume2 } from 'react-icons/fi'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import useVoiceRecorder from '../hooks/useVoiceRecorder'
import { processVoice, textSearch } from '../services/api'

function ProductMiniCard({ product }) {
  return (
    <Link
      to={`/product/${product._id}`}
      className="flex-shrink-0 w-36 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all no-underline border border-gray-100"
    >
      <div className="aspect-square bg-gray-100 overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-pink-50"><span className="text-2xl">👗</span></div>
        )}
      </div>
      <div className="p-2">
        <p className="text-xs text-gray-500 truncate">{product.brand}</p>
        <p className="text-xs font-medium text-gray-800 truncate mt-0.5">{product.name}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs font-bold text-gray-900">₹{product.price?.toLocaleString('en-IN')}</span>
          {product.rating > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-green-600"><FiStar size={9} fill="currentColor" />{product.rating}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

function MessageBubble({ message }) {
  const audioRef = useRef(null)

  if (message.type === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-primary text-white px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[80%] shadow-sm">
          {message.lang && (
            <span className="text-[10px] opacity-70 block mb-1">
              {message.isVoice ? '🎤 ' : ''}{message.lang}
            </span>
          )}
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[90%]">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs">🤖</div>
          <span className="text-xs text-gray-400">Assistant</span>
        </div>

        {message.text && (
          <div className="bg-white border border-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm mb-2">
            <p className="text-sm text-gray-700 leading-relaxed">{message.text}</p>
            {message.audio && (
              <>
                <button
                  onClick={() => audioRef.current?.play()}
                  className="mt-2 flex items-center gap-1 text-xs text-primary hover:text-primary/80 cursor-pointer bg-transparent border-0 p-0"
                >
                  <FiVolume2 size={13} /> Play
                </button>
                <audio ref={audioRef} src={message.audio} className="hidden" />
              </>
            )}
          </div>
        )}

        {message.products && message.products.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {message.products.map((p) => (
              <ProductMiniCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const { t, i18n } = useTranslation()
  const { isRecording, audioBlob, error, startRecording, stopRecording, resetRecording } = useVoiceRecorder()

  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, { id: Date.now(), ...msg }])
  }

  const handleVoiceResult = useCallback(async () => {
    if (!audioBlob) return

    setIsProcessing(true)
    addMessage({ type: 'user', text: '🎤 Processing voice...', isVoice: true })

    try {
      const result = await processVoice(audioBlob, i18n.language)
      const langLabel = { hi: 'Hindi', ta: 'Tamil', te: 'Telugu', kn: 'Kannada', bn: 'Bengali', mr: 'Marathi', gu: 'Gujarati', en: 'English' }

      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          text: result.transcript || 'Could not understand',
          lang: langLabel[result.detected_language] || result.detected_language,
        }
        return updated
      })

      addMessage({
        type: 'assistant',
        text: result.response_text || `Found ${result.products?.length || 0} products`,
        products: result.products || [],
        audio: result.response_audio,
      })
    } catch {
      addMessage({ type: 'assistant', text: 'Something went wrong. Please try again.' })
    } finally {
      setIsProcessing(false)
      resetRecording()
    }
  }, [audioBlob, i18n.language, resetRecording])

  useEffect(() => {
    if (audioBlob) handleVoiceResult()
  }, [audioBlob, handleVoiceResult])

  const handleTextSubmit = async (query) => {
    if (!query.trim() || isProcessing) return

    const text = query.trim()
    setInputText('')
    setIsProcessing(true)

    addMessage({ type: 'user', text })

    try {
      const result = await textSearch(text, i18n.language)
      addMessage({
        type: 'assistant',
        text: result.response_text || `Found ${result.products?.length || 0} products`,
        products: result.products || [],
        audio: result.response_audio,
      })
    } catch {
      addMessage({ type: 'assistant', text: 'Something went wrong. Please try again.' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    handleTextSubmit(inputText)
  }

  const handleMicClick = () => {
    if (isProcessing) return
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const suggestions = [t('example_1'), t('example_2'), t('example_3')]

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center pb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <FiMic size={28} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('welcome_title')}</h1>
            <p className="text-gray-400 text-sm mb-8 max-w-sm">{t('welcome_subtitle')}</p>

            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleTextSubmit(s)}
                  className="px-4 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-600 hover:border-primary hover:text-primary cursor-pointer transition-all active:scale-95"
                >
                  &ldquo;{s}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isProcessing && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <p className="text-red-500 text-xs text-center py-1">{error}</p>
      )}

      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <form onSubmit={handleFormSubmit} className="max-w-3xl mx-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isProcessing}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-0 cursor-pointer transition-all ${
              isRecording
                ? 'bg-red-500 mic-pulse'
                : 'bg-primary hover:bg-primary/90'
            } disabled:bg-gray-300 disabled:cursor-not-allowed`}
          >
            {isRecording ? (
              <FiMicOff size={18} className="text-white" />
            ) : (
              <FiMic size={18} className="text-white" />
            )}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isRecording ? t('listening') + '...' : t('search_placeholder')}
            disabled={isRecording || isProcessing}
            className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 text-sm outline-none focus:border-primary focus:bg-white transition-all disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 border-0 cursor-pointer hover:bg-primary/90 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <AiOutlineLoading3Quarters size={18} className="text-white animate-spin" />
            ) : (
              <FiSend size={18} className="text-white" />
            )}
          </button>
        </form>

        {isRecording && (
          <div className="flex items-center justify-center gap-1 mt-2 h-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="sound-wave-bar" />
            ))}
            <span className="text-xs text-red-500 ml-2">{t('listening')}</span>
          </div>
        )}
      </div>
    </div>
  )
}
