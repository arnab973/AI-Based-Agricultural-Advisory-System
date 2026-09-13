import os
from dotenv import load_dotenv
from pinecone import Pinecone

load_dotenv()

pc = Pinecone(
    api_key=os.getenv("PINECONE_API_KEY")
)

index = pc.Index(
    os.getenv("PINECONE_INDEX_NAME")
)


def upload_to_pinecone(chunks, get_embedding):
    vectors = []

    for i, chunk in enumerate(chunks):
        text = chunk.page_content
        embedding = get_embedding(text)

        vectors.append({
            "id": str(i),
            "values": embedding,
            "metadata": {
                "text": text,
                "source": chunk.metadata.get("source", "Unknown"),
                "page": chunk.metadata.get("page", None)
            }
        })

    batch_size = 50

    for i in range(0, len(vectors), batch_size):
        batch = vectors[i:i + batch_size]

        index.upsert(
            vectors=batch
        )

        print(
            f"Uploaded {i + len(batch)}/{len(vectors)} vectors"
        )


def search_pinecone(query_text, get_embedding, top_k=5):
    query_embedding = get_embedding(query_text)

    results = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True
    )

    matches = []

    for match in results.matches:
        metadata = match.metadata or {}

        matches.append({
            "text": metadata.get("text", ""),
            "source": metadata.get("source", "Unknown"),
            "page": metadata.get("page"),
            "score": match.score
        })

    return matches