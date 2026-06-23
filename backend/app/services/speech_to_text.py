from deepgram import DeepgramClient, PrerecordedOptions, FileSource
from app.config import DEEPGRAM_API_KEY

deepgram = None


def get_deepgram():
    global deepgram
    if deepgram is None and DEEPGRAM_API_KEY:
        deepgram = DeepgramClient(DEEPGRAM_API_KEY)
    return deepgram


async def transcribe_audio(audio_bytes: bytes, mime_type: str = "audio/wav") -> dict:
    dg = get_deepgram()
    if not dg:
        return {"transcript": "", "language": "en", "error": "Deepgram API key not configured"}

    payload: FileSource = {"buffer": audio_bytes}
    options = PrerecordedOptions(
        model="nova-2",
        detect_language=True,
        smart_format=True,
        punctuate=True,
    )

    response = await dg.listen.asyncrest.v("1").transcribe_file(payload, options)
    result = response.results
    transcript = result.channels[0].alternatives[0].transcript
    detected_lang = result.channels[0].detected_language or "hi"

    return {
        "transcript": transcript,
        "language": detected_lang,
        "confidence": result.channels[0].alternatives[0].confidence,
    }
