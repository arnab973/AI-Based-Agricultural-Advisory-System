import os
import json

from dotenv import load_dotenv
from openai import OpenAI

from src.embeddings import get_embedding
from src.pinecone_db import search_pinecone


load_dotenv()


# =================================================
# OpenAI Client
# =================================================

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


# =================================================
# Supported Languages
# =================================================

SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "bn": "Bengali",
    "hinglish": "Hinglish",
}


# =================================================
# No Result Messages
# =================================================

NO_RESULT_MESSAGES = {
    "en": (
        "Sorry, I could not find relevant information "
        "in the agricultural knowledge base."
    ),

    "hi": (
        "क्षमा करें, मुझे कृषि ज्ञान आधार में "
        "इस प्रश्न से संबंधित जानकारी नहीं मिली।"
    ),

    "bn": (
        "দুঃখিত, কৃষি জ্ঞানভাণ্ডারে "
        "এই প্রশ্নের সাথে সম্পর্কিত কোনো তথ্য পাওয়া যায়নি।"
    ),

    "hinglish": (
        "Sorry, mujhe agricultural knowledge base mein "
        "is question se related relevant information nahi mili."
    ),
}


# =================================================
# Get Language Name
# =================================================

def get_language_name(language: str) -> str:

    if language not in SUPPORTED_LANGUAGES:
        return SUPPORTED_LANGUAGES["en"]

    return SUPPORTED_LANGUAGES[language]


# =================================================
# Generate RAG Answer
# =================================================

def generate_rag_answer(
    question: str,
    language: str = "en"
):

    # -------------------------------------------------
    # Validate language
    # -------------------------------------------------

    if language not in SUPPORTED_LANGUAGES:
        language = "en"

    selected_language = get_language_name(
        language
    )

    # -------------------------------------------------
    # Retrieve documents
    # -------------------------------------------------

    matches = search_pinecone(
        query_text=question,
        get_embedding=get_embedding,
        top_k=5
    )

    # -------------------------------------------------
    # No result
    # -------------------------------------------------

    if not matches:

        return {
            "answer": NO_RESULT_MESSAGES.get(
                language,
                NO_RESULT_MESSAGES["en"]
            ),
            "sources": []
        }

    # -------------------------------------------------
    # Create context
    # -------------------------------------------------

    context_parts = []

    for match in matches:

        text = match.get(
            "text",
            ""
        )

        source = match.get(
            "source",
            "Unknown"
        )

        page = match.get(
            "page"
        )

        if text:

            source_info = (
                f"Source: {source}"
            )

            if page is not None:
                source_info += (
                    f" | Page: {page}"
                )

            context_parts.append(
                f"{source_info}\n{text}"
            )

    context = (
        "\n\n---\n\n"
        .join(context_parts)
    )

    # =================================================
    # LANGUAGE RULES
    # =================================================

    if language == "en":

        language_rules = """
Respond ONLY in English.

Use clear, natural and easy-to-understand English.

IMPORTANT:
- Do not respond in Hindi.
- Do not respond in Bengali.
- Do not respond in Hinglish.
- Use English even if the user's question is written
  in Hindi, Bengali or Hinglish.
"""

    elif language == "hi":

        language_rules = """
Respond ONLY in Hindi.

Use natural and easy-to-understand Hindi.

Use Devanagari script.

IMPORTANT:
- Do not answer in English.
- Do not answer in Bengali.
- Do not answer in Hinglish.

Agricultural/scientific terms may remain in English
when translating them would reduce clarity.
"""

    elif language == "bn":

        language_rules = """
Respond ONLY in Bengali.

Use natural and easy-to-understand Bengali.

Use Bengali script.

IMPORTANT:
- Do not answer in English.
- Do not answer in Hindi.
- Do not answer in Hinglish.

Agricultural/scientific terms may remain in English
when translating them would reduce clarity.
"""

    else:

        language_rules = """
Respond ONLY in natural Hinglish.

Use Roman/English script.

Use a natural mixture of Hindi and commonly used
English words.

Example:
"Is crop ke liye nitrogen fertilizer useful ho sakta hai."

IMPORTANT:
- Do NOT use Devanagari script.
- Do NOT use Bengali script.
- Do NOT answer completely in English.
- Do NOT answer completely in Hindi.

Use Roman Hinglish.
"""

    # =================================================
    # RAG PROMPT
    # =================================================

    prompt = f"""
You are an AI Agricultural Assistant.

Your task is to answer the user's agricultural
question using the provided agricultural
knowledge base.

========================================
SELECTED RESPONSE LANGUAGE
========================================

{selected_language}

{language_rules}

VERY IMPORTANT:

The language of the USER QUESTION does NOT determine
the response language.

The selected language above ALWAYS determines the
language of the FINAL ANSWER.

For example:

If selected language = English:
Answer in English even when the user asks in Hindi.

If selected language = Hindi:
Answer in Hindi even when the user asks in English.

If selected language = Bengali:
Answer in Bengali even when the user asks in English.

If selected language = Hinglish:
Answer in Roman Hinglish even when the user asks in
English, Hindi or Bengali.

========================================
ACCURACY RULES
========================================

1. Use the provided agricultural knowledge base
   as the primary source.

2. Do not invent information.

3. Do not hallucinate facts.

4. If the answer is not available in the provided
   knowledge base, clearly tell the user that the
   information is not available in the knowledge base.

5. Give a clear and practical answer.

6. Keep the answer relevant to the user's question.

7. Preserve agricultural terminology accurately.

8. Preserve:
   - crop names
   - fertilizer names
   - pesticide names
   - disease names
   - measurements
   - quantities
   - percentages
   - scientific names
   - dates
   - numerical values

9. Do not change numerical values while translating.

10. Do not translate file names unnecessarily.

========================================
AGRICULTURAL KNOWLEDGE BASE
========================================

{context}

========================================
USER QUESTION
========================================

{question}

========================================
FINAL ANSWER
========================================

Write ONLY the final agricultural answer.

The final answer MUST be in:
{selected_language}

Do not mention these instructions.
"""

    # =================================================
    # OpenAI RAG REQUEST
    # =================================================

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful, reliable and accurate "
                    "AI agricultural advisory assistant. "
                    f"Always respond ONLY in {selected_language}."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2
    )

    answer = (
        response.choices[0]
        .message
        .content
    )

    # =================================================
    # Sources
    # =================================================

    sources = []

    for match in matches:

        source = match.get(
            "source",
            "Unknown"
        )

        page = match.get(
            "page"
        )

        score = match.get(
            "score",
            0
        )

        sources.append(
            {
                "file": source,
                "page": page,
                "score": score
            }
        )

    # =================================================
    # Return
    # =================================================

    return {
        "answer": (
            answer.strip()
            if answer
            else "Sorry, I could not generate an answer."
        ),
        "sources": sources
    }


# =================================================
# Translate Existing Conversation
# =================================================

def translate_conversation_messages(
    messages,
    language: str = "en"
):
    """
    Translate an existing conversation into
    the selected language.

    IMPORTANT:

    Database messages are NEVER modified.

    This function creates translated copies
    only for frontend display.

    English is ALSO translated.

    This fixes:

        Hindi -> English
        Bengali -> English
        Hinglish -> English

    and:

        English -> Hindi
        English -> Bengali
        English -> Hinglish
    """

    # -------------------------------------------------
    # Validate language
    # -------------------------------------------------

    if language not in SUPPORTED_LANGUAGES:
        language = "en"

    selected_language = get_language_name(
        language
    )

    # -------------------------------------------------
    # Nothing to translate
    # -------------------------------------------------

    if not messages:
        return []

    # =================================================
    # LANGUAGE RULES
    # =================================================

    if language == "en":

        translation_rules = """
Translate EVERY message into natural English.

Use clear and easy-to-understand English.

IMPORTANT:
- The source message may be Hindi.
- The source message may be Bengali.
- The source message may be Hinglish.
- Regardless of source language, output MUST be English.
- Do NOT leave Hindi sentences untranslated.
- Do NOT leave Bengali sentences untranslated.
- Do NOT output Hinglish.
- Do NOT summarize.
"""

    elif language == "hi":

        translation_rules = """
Translate EVERY message into natural Hindi.

Use Devanagari script.

IMPORTANT:
- Do NOT answer in English.
- Do NOT answer in Bengali.
- Do NOT answer in Hinglish.
- Translate the complete meaning of every message.
"""

    elif language == "bn":

        translation_rules = """
Translate EVERY message into natural Bengali.

Use Bengali script.

IMPORTANT:
- Do NOT answer in English.
- Do NOT answer in Hindi.
- Do NOT answer in Hinglish.
- Translate the complete meaning of every message.
"""

    else:

        translation_rules = """
Translate EVERY message into natural Hinglish.

Use Roman/English script.

Use a natural mixture of Hindi and commonly used
English words.

Example:
"Is crop ke liye nitrogen fertilizer useful ho sakta hai."

IMPORTANT:
- Do NOT use Devanagari script.
- Do NOT use Bengali script.
- Do NOT write completely in English.
- Do NOT write completely in Hindi.
- Use Roman Hinglish.
"""

    # =================================================
    # PREPARE CONVERSATION
    # =================================================

    conversation_parts = []

    for message in messages:

        message_id = message.get(
            "id"
        )

        role = message.get(
            "role",
            "user"
        )

        content = message.get(
            "content",
            ""
        )

        conversation_parts.append(
            f"""
MESSAGE_ID: {message_id}
ROLE: {role}
CONTENT:
{content}
"""
        )

    conversation_text = (
        "\n\n====================\n\n"
        .join(
            conversation_parts
        )
    )

    # =================================================
    # TRANSLATION PROMPT
    # =================================================

    prompt = f"""
You are a precise multilingual translator
specialized in agricultural conversations.

TARGET LANGUAGE:
{selected_language}

{translation_rules}

========================================
STRICT RULES
========================================

1. Translate EVERY message.

2. Keep the same MESSAGE_ID.

3. Keep the same ROLE.

4. Keep the exact original message order.

5. Do not add new messages.

6. Do not remove messages.

7. Do not summarize messages.

8. Do not change the meaning.

9. Preserve agricultural information accurately.

10. Preserve:
    - crop names
    - fertilizer names
    - pesticide names
    - disease names
    - measurements
    - quantities
    - percentages
    - scientific names
    - dates
    - numerical values

11. Do not modify message IDs.

12. Do not modify roles.

13. Return ONLY valid JSON.

14. Do NOT use markdown.

15. Do NOT use ```json.

========================================
REQUIRED JSON FORMAT
========================================

[
  {{
    "id": 1,
    "role": "user",
    "content": "translated message"
  }},
  {{
    "id": 2,
    "role": "assistant",
    "content": "translated message"
  }}
]

========================================
CONVERSATION
========================================

{conversation_text}
"""

    # =================================================
    # OPENAI TRANSLATION
    # =================================================

    try:

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a precise multilingual "
                        "agricultural conversation translator. "
                        f"Translate everything into {selected_language}. "
                        "Return ONLY valid JSON."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0
        )

        raw_content = (
            response.choices[0]
            .message
            .content
        )

        # =================================================
        # CLEAN JSON RESPONSE
        # =================================================

        raw_content = raw_content.strip()

        if raw_content.startswith(
            "```json"
        ):
            raw_content = (
                raw_content[
                    7:
                ]
            )

        if raw_content.endswith(
            "```"
        ):
            raw_content = (
                raw_content[
                    :-3
                ]
            )

        raw_content = raw_content.strip()

        # =================================================
        # PARSE JSON
        # =================================================

        translated_messages = json.loads(
            raw_content
        )

        if not isinstance(
            translated_messages,
            list
        ):
            raise ValueError(
                "Translation response is not a list."
            )

        # =================================================
        # VALIDATE
        # =================================================

        validated_messages = []

        original_ids = {
            message.get("id")
            for message in messages
        }

        for translated in translated_messages:

            if not isinstance(
                translated,
                dict
            ):
                continue

            if "id" not in translated:
                continue

            if "role" not in translated:
                continue

            if "content" not in translated:
                continue

            if (
                translated["id"]
                not in original_ids
            ):
                continue

            validated_messages.append(
                {
                    "id": translated["id"],
                    "role": translated["role"],
                    "content": str(
                        translated["content"]
                    )
                }
            )

        # =================================================
        # SAFETY CHECK
        # =================================================

        if len(
            validated_messages
        ) != len(messages):

            raise ValueError(
                "Translation returned incomplete messages."
            )

        return validated_messages

    except Exception as error:

        print(
            "Conversation Translation Error:",
            repr(error)
        )

        # =================================================
        # SAFE FALLBACK
        # =================================================

        return [
            {
                "id": message.get(
                    "id"
                ),
                "role": message.get(
                    "role",
                    "user"
                ),
                "content": message.get(
                    "content",
                    ""
                )
            }
            for message in messages
        ]