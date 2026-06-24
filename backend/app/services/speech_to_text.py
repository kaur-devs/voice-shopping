import aiohttp
from app.config import DEEPGRAM_API_KEY

DEEPGRAM_URL = "https://api.deepgram.com/v1/listen"


async def transcribe_audio(audio_bytes: bytes, mime_type: str = "audio/webm") -> dict:
    if not DEEPGRAM_API_KEY:
        return {"transcript": "", "language": "en", "error": "Deepgram API key not configured"}

    headers = {
        "Authorization": f"Token {DEEPGRAM_API_KEY}",
        "Content-Type": mime_type,
    }
    params = {
        "model": "nova-2",
        "detect_language": "true",
        "smart_format": "true",
        "punctuate": "true",
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                DEEPGRAM_URL,
                headers=headers,
                params=params,
                data=audio_bytes,
                timeout=aiohttp.ClientTimeout(total=30),
            ) as response:
                response.raise_for_status()
                data = await response.json()

        channel = data["results"]["channels"][0]
        transcript = channel["alternatives"][0]["transcript"]
        detected_lang = channel.get("detected_language", "hi")
        confidence = channel["alternatives"][0].get("confidence", 0)

        return {
            "transcript": transcript,
            "language": detected_lang,
            "confidence": confidence,
        }
    except Exception as e:
        return {"transcript": "", "language": "en", "error": str(e)}
