import { useRef, useEffect } from 'react'
import { FiVolume2 } from 'react-icons/fi'

export default function ChatBubble({ transcript, responseText, responseAudio, detectedLanguage }) {
  const audioRef = useRef(null)

  useEffect(() => {
    if (responseAudio && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }, [responseAudio])

  if (!transcript && !responseText) return null

  const langLabel = {
    hi: '🇮🇳 Hindi', ta: '🇮🇳 Tamil', te: '🇮🇳 Telugu', kn: '🇮🇳 Kannada',
    bn: '🇮🇳 Bengali', mr: '🇮🇳 Marathi', gu: '🇮🇳 Gujarati', en: '🇬🇧 English',
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-3 my-6 animate-fade-in-up">
      {transcript && (
        <div className="flex justify-end">
          <div className="bg-primary text-white px-4 py-3 rounded-2xl rounded-br-sm max-w-[80%] text-sm shadow-md">
            <div className="flex items-center gap-2 opacity-70 text-xs mb-1.5">
              <span>You said</span>
              {detectedLanguage && (
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">
                  {langLabel[detectedLanguage] || detectedLanguage}
                </span>
              )}
            </div>
            <p className="leading-relaxed">{transcript}</p>
          </div>
        </div>
      )}

      {responseText && (
        <div className="flex justify-start">
          <div className="bg-white border border-border px-4 py-3 rounded-2xl rounded-bl-sm max-w-[80%] text-sm shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-text-light mb-1.5">
              <span className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-[10px]">🤖</span>
              <span>Assistant</span>
            </div>
            <p className="leading-relaxed">{responseText}</p>
            {responseAudio && (
              <button
                onClick={() => audioRef.current?.play()}
                className="mt-2.5 flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark cursor-pointer bg-pink-50 hover:bg-pink-100 border-0 px-3 py-1.5 rounded-full transition-colors"
              >
                <FiVolume2 size={14} />
                Play response
              </button>
            )}
          </div>
        </div>
      )}

      {responseAudio && (
        <audio ref={audioRef} src={responseAudio} className="hidden" />
      )}
    </div>
  )
}
