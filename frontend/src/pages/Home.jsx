import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FiMic, FiMicOff, FiSend, FiStar, FiVolume2, FiTrash2 } from 'react-icons/fi'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import useVoiceRecorder from '../hooks/useVoiceRecorder'
import { processVoice, textSearch } from '../services/api'

function ProductMiniCard({ product }) {
  return (
    <Link
      to={`/product/${product._id}`}
      className="flex-shrink-0 w-40 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all no-underline border border-gray-100 group"
    >
      <div className="aspect-square bg-gray-50 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50">
            <span className="text-3xl">👗</span>
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-[11px] text-gray-400 truncate uppercase tracking-wide">{product.brand}</p>
        <p className="text-xs font-medium text-gray-800 truncate mt-0.5 leading-snug">{product.name}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-sm font-bold text-gray-900">₹{product.price?.toLocaleString('en-IN')}</span>
          {product.rating > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">
              <FiStar size={8} fill="currentColor" />{product.rating}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4 animate-fade-in-up">
      <div className="max-w-[90%]">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-6 h-6 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center text-xs">🤖</div>
          <span className="text-xs text-gray-400">Assistant</span>
        </div>
        <div className="bg-white border border-gray-100 px-5 py-3.5 rounded-2xl rounded-bl-sm shadow-sm">
          <div className="flex gap-1.5 items-center">
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }) {
  const audioRef = useRef(null)

  if (message.type === 'user') {
    return (
      <div className="flex justify-end mb-4 animate-fade-in-up">
        <div className="bg-gradient-to-br from-primary to-primary-dark text-white px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[80%] shadow-sm">
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
    <div className="flex justify-start mb-4 animate-fade-in-up">
      <div className="max-w-[90%]">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-6 h-6 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center text-xs">🤖</div>
          <span className="text-xs text-gray-400">Assistant</span>
        </div>

        {message.text && (
          <div className="bg-white border border-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm mb-2">
            <p className="text-sm text-gray-700 leading-relaxed">{message.text}</p>
            {message.audio && (
              <>
                <button
                  onClick={() => audioRef.current?.play()}
                  className="mt-2 flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark cursor-pointer bg-primary/5 hover:bg-primary/10 rounded-full px-3 py-1.5 border-0 transition-all"
                >
                  <FiVolume2 size={13} /> Listen
                </button>
                <audio ref={audioRef} src={message.audio} className="hidden" />
              </>
            )}
          </div>
        )}

        {message.products && message.products.length > 0 && (
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
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

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('chat_messages')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem('chat_messages', JSON.stringify(messages))
    } catch {}
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, { id: Date.now(), ...msg }])
  }

  const clearChat = () => {
    setMessages([])
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
          <div className="flex flex-col items-center justify-center h-full text-center pb-12 animate-fade-in-up">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center">
                <FiMic size={32} className="text-primary" />
              </div>
              <div className="absolute -inset-2 bg-primary/5 rounded-full animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('welcome_title')}</h1>
            <p className="text-gray-400 text-sm mb-8 max-w-sm leading-relaxed">{t('welcome_subtitle')}</p>

            <div className="flex flex-wrap justify-center gap-2.5">
              {suggestions.map((s, i) => (
                <button
                  key={s}
                  onClick={() => handleTextSubmit(s)}
                  className="px-5 py-2.5 bg-white rounded-full border border-gray-200 text-sm text-gray-600 hover:border-primary hover:text-primary hover:shadow-sm cursor-pointer transition-all active:scale-95"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  &ldquo;{s}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="flex justify-end mb-3">
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 cursor-pointer bg-transparent border-0 px-2 py-1 rounded-lg hover:bg-red-50 transition-all"
            >
              <FiTrash2 size={12} /> Clear chat
            </button>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isProcessing && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <p className="text-red-500 text-xs text-center py-1">{error}</p>
      )}

      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-lg px-4 py-3">
        <form onSubmit={handleFormSubmit} className="max-w-3xl mx-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isProcessing}
            className={`relative w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-0 cursor-pointer transition-all ${
              isRecording
                ? 'bg-red-500 mic-pulse shadow-lg shadow-red-200'
                : 'bg-primary hover:bg-primary-dark hover:shadow-md hover:shadow-pink-200'
            } disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none`}
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
            className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 text-sm outline-none focus:border-primary focus:bg-white focus:shadow-sm transition-all disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shrink-0 border-0 cursor-pointer hover:bg-primary-dark hover:shadow-md hover:shadow-pink-200 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isProcessing ? (
              <AiOutlineLoading3Quarters size={18} className="text-white animate-spin" />
            ) : (
              <FiSend size={18} className="text-white" />
            )}
          </button>
        </form>

        {isRecording && (
          <div className="flex items-center justify-center gap-1.5 mt-2 h-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="sound-wave-bar" />
            ))}
            <span className="text-xs text-red-500 ml-2 font-medium">{t('listening')}</span>
          </div>
        )}
      </div>
    </div>
  )
}
