from fastapi import APIRouter, UploadFile, File, Form
from app.services.speech_to_text import transcribe_audio
from app.services.translator import translate_to_english, translate_from_english
from app.services.text_to_speech import generate_speech
from app.services.product_search import parse_intent, search_products

router = APIRouter()


@router.post("/process")
async def process_voice(
    audio: UploadFile = File(...),
    language: str = Form("auto"),
):
    audio_bytes = await audio.read()

    stt_result = await transcribe_audio(audio_bytes, mime_type=audio.content_type or "audio/wav")
    transcript = stt_result.get("transcript", "")
    detected_lang = stt_result.get("language", "hi")

    if detected_lang == "en":
        english_text = transcript
    else:
        english_text = translate_to_english(transcript, src_lang=detected_lang)

    intent = parse_intent(english_text)
    products = await search_products(intent)

    product_count = len(products)
    if product_count > 0:
        response_en = f"I found {product_count} products for you."
        if intent.get("product_type"):
            response_en = f"Here are {product_count} {intent['product_type']}s for you."
        if intent.get("color"):
            response_en = f"Here are {product_count} {intent['color']} {intent.get('product_type', 'item')}s for you."
    else:
        response_en = "Sorry, I couldn't find any products matching your request. Try something else."

    if detected_lang != "en":
        response_local = translate_from_english(response_en, dest_lang=detected_lang)
    else:
        response_local = response_en

    audio_response = generate_speech(response_local, lang=detected_lang)

    return {
        "transcript": transcript,
        "detected_language": detected_lang,
        "english_text": english_text,
        "intent": intent,
        "products": products,
        "response_text": response_local,
        "response_audio": audio_response,
    }


@router.post("/text-search")
async def text_search(query: str = Form(...), language: str = Form("en")):
    if language != "en":
        english_text = translate_to_english(query, src_lang=language)
    else:
        english_text = query

    intent = parse_intent(english_text)
    products = await search_products(intent)

    return {
        "original_query": query,
        "english_text": english_text,
        "intent": intent,
        "products": products,
    }
