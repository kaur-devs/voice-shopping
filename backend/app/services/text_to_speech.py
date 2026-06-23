import io
import base64
from gtts import gTTS

LANG_MAP = {
    "hi": "hi",
    "ta": "ta",
    "te": "te",
    "kn": "kn",
    "bn": "bn",
    "mr": "mr",
    "gu": "gu",
    "en": "en",
}


def generate_speech(text: str, lang: str = "hi") -> str:
    gtts_lang = LANG_MAP.get(lang, "en")
    try:
        tts = gTTS(text=text, lang=gtts_lang, slow=False)
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        audio_b64 = base64.b64encode(audio_buffer.read()).decode("utf-8")
        return f"data:audio/mp3;base64,{audio_b64}"
    except Exception:
        return ""
