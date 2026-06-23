import { useTranslation } from 'react-i18next'
import { FiMic, FiMicOff } from 'react-icons/fi'

export default function VoiceButton({ isRecording, isProcessing, onStart, onStop }) {
  const { t } = useTranslation()

  const handleClick = () => {
    if (isProcessing) return
    if (isRecording) {
      onStop()
    } else {
      onStart()
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleClick}
        disabled={isProcessing}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer border-0 ${
          isProcessing
            ? 'bg-gray-300 cursor-not-allowed'
            : isRecording
            ? 'bg-red-500 hover:bg-red-600 mic-pulse'
            : 'bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl hover:scale-105'
        }`}
      >
        {isRecording ? (
          <FiMicOff size={32} className="text-white relative z-10" />
        ) : (
          <FiMic size={32} className="text-white" />
        )}
      </button>

      <p className="text-sm text-text-light">
        {isProcessing
          ? t('processing')
          : isRecording
          ? t('listening')
          : t('voice_prompt')}
      </p>
    </div>
  )
}
