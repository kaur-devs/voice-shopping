from googletrans import Translator

SUPPORTED_LANGUAGES = {
    "hi": "Hindi",
    "ta": "Tamil",
    "te": "Telugu",
    "kn": "Kannada",
    "bn": "Bengali",
    "mr": "Marathi",
    "gu": "Gujarati",
    "en": "English",
}

_translator = None


def _get_translator():
    global _translator
    _translator = Translator()
    return _translator


def translate_text(text: str, src: str = "auto", dest: str = "en") -> dict:
    if not text.strip():
        return {"translated": "", "src": src, "dest": dest}

    if src == dest and src != "auto":
        return {"translated": text, "src": src, "dest": dest}

    for attempt in range(3):
        try:
            t = _get_translator()
            result = t.translate(text, src=src, dest=dest)
            return {
                "translated": result.text,
                "src": result.src,
                "dest": dest,
            }
        except Exception:
            if attempt == 2:
                return {"translated": text, "src": src, "dest": dest, "error": "translation failed"}


def detect_language(text: str) -> str:
    if not text.strip():
        return "en"
    try:
        t = _get_translator()
        detected = t.detect(text)
        lang = detected.lang if hasattr(detected, 'lang') else "en"
        return lang if lang in SUPPORTED_LANGUAGES else "en"
    except Exception:
        return "en"


def is_english(text: str) -> bool:
    try:
        text.encode('ascii')
        return True
    except UnicodeEncodeError:
        return False


def translate_to_english(text: str, src_lang: str = "auto") -> str:
    if is_english(text):
        return text
    result = translate_text(text, src=src_lang, dest="en")
    return result["translated"]


def translate_from_english(text: str, dest_lang: str = "hi") -> str:
    if dest_lang == "en":
        return text
    result = translate_text(text, src="en", dest=dest_lang)
    return result["translated"]
