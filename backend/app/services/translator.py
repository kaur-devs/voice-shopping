from googletrans import Translator

translator = Translator()

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


def translate_text(text: str, src: str = "auto", dest: str = "en") -> dict:
    if not text.strip():
        return {"translated": "", "src": src, "dest": dest}

    if src == dest:
        return {"translated": text, "src": src, "dest": dest}

    try:
        result = translator.translate(text, src=src, dest=dest)
        return {
            "translated": result.text,
            "src": result.src,
            "dest": dest,
        }
    except Exception as e:
        return {"translated": text, "src": src, "dest": dest, "error": str(e)}


def translate_to_english(text: str, src_lang: str = "auto") -> str:
    result = translate_text(text, src=src_lang, dest="en")
    return result["translated"]


def translate_from_english(text: str, dest_lang: str = "hi") -> str:
    if dest_lang == "en":
        return text
    result = translate_text(text, src="en", dest=dest_lang)
    return result["translated"]
