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

  return (
    <div className="w-full max-w-xl mx-auto space-y-3 my-6">
      {transcript && (
        <div className="flex justify-end">
          <div className="bg-primary text-white px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[80%] text-sm">
            <p className="opacity-70 text-xs mb-1">You said:</p>
            <p>{transcript}</p>
          </div>
        </div>
      )}

      {responseText && (
        <div className="flex justify-start">
          <div className="bg-white border border-border px-4 py-2.5 rounded-2xl rounded-bl-sm max-w-[80%] text-sm shadow-sm">
            <p>{responseText}</p>
            {responseAudio && (
              <button
                onClick={() => audioRef.current?.play()}
                className="mt-2 flex items-center gap-1 text-xs text-primary hover:text-primary-dark cursor-pointer bg-transparent border-0 p-0"
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
