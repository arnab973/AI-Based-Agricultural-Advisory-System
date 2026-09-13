import json
from pathlib import Path

import numpy as np
import tensorflow as tf
from PIL import Image


# =========================================================
# PATHS
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "crop_health_model.keras"
CLASS_NAMES_PATH = BASE_DIR / "models" / "class_names.json"

IMAGE_SIZE = (224, 224)


# =========================================================
# LOAD MODEL
# =========================================================

print("🌱 Loading Crop Health AI model...")

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Crop health model not found: {MODEL_PATH}"
    )

if not CLASS_NAMES_PATH.exists():
    raise FileNotFoundError(
        f"Class names file not found: {CLASS_NAMES_PATH}"
    )

model = tf.keras.models.load_model(MODEL_PATH)

with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as file:
    class_names = json.load(file)

print(
    f"✅ Crop Health model loaded successfully "
    f"({len(class_names)} classes)"
)


# =========================================================
# DISEASE RECOMMENDATIONS
# =========================================================

RECOMMENDATIONS = {

    "Pepper__bell___Bacterial_spot":
        "Remove infected leaves and avoid overhead irrigation. Keep the plant area clean and dry.",

    "Pepper__bell___healthy":
        "Your pepper plant appears healthy. Continue proper watering, sunlight and regular monitoring.",

    "Potato___Early_blight":
        "Remove affected leaves and avoid excessive moisture. Improve air circulation and use appropriate disease management if symptoms increase.",

    "Potato___Late_blight":
        "Remove infected plant material and avoid overhead irrigation. Monitor nearby plants because late blight can spread quickly.",

    "Potato___healthy":
        "Your potato plant appears healthy. Continue regular irrigation, sunlight and crop monitoring.",

    "Tomato_Bacterial_spot":
        "Remove affected leaves and avoid working with wet plants. Maintain good airflow and avoid overhead watering.",

    "Tomato_Early_blight":
        "Remove infected leaves, improve air circulation and avoid water staying on the foliage.",

    "Tomato_Late_blight":
        "Remove severely affected leaves and avoid overhead irrigation. Monitor the crop closely for rapid disease spread.",

    "Tomato_Leaf_Mold":
        "Improve ventilation and reduce humidity around the foliage. Avoid excessive watering and remove severely affected leaves.",

    "Tomato_Septoria_leaf_spot":
        "Remove infected leaves and keep foliage dry. Improve air circulation and avoid overhead watering.",

    "Tomato_Spider_mites_Two_spotted_spider_mite":
        "Inspect the underside of leaves carefully. Remove heavily affected leaves and maintain suitable plant moisture.",

    "Tomato__Target_Spot":
        "Remove affected leaves and improve air circulation. Avoid prolonged leaf wetness.",

    "Tomato__Tomato_YellowLeaf__Curl_Virus":
        "Remove severely infected plants where appropriate and control whiteflies, which can spread the virus.",

    "Tomato__Tomato_mosaic_virus":
        "Remove infected plant material and sanitize tools. Avoid handling healthy plants after touching infected plants.",

    "Tomato_healthy":
        "Your tomato plant appears healthy. Continue proper watering, sunlight, nutrition and regular monitoring.",
}


# =========================================================
# HEALTH SCORE
# =========================================================

def calculate_health_score(
    class_name: str,
    confidence: float
) -> int:

    class_lower = class_name.lower()

    # Healthy crop
    if "healthy" in class_lower:
        return min(
            100,
            max(
                90,
                int(90 + confidence * 0.10)
            )
        )

    # Severe diseases
    severe_keywords = [
        "late_blight",
        "yellowleaf",
        "mosaic_virus",
    ]

    for keyword in severe_keywords:
        if keyword in class_lower:
            return max(
                30,
                min(
                    65,
                    int(100 - confidence * 0.40)
                )
            )

    # Other detected diseases
    return max(
        45,
        min(
            80,
            int(100 - confidence * 0.35)
        )
    )


# =========================================================
# IMAGE PREDICTION
# =========================================================

def predict_crop_health(image_bytes: bytes):

    # -----------------------------------------------------
    # Open image
    # -----------------------------------------------------

    try:

        from io import BytesIO

        image = Image.open(
            BytesIO(image_bytes)
        ).convert("RGB")

    except Exception as error:

        raise ValueError(
            f"Invalid image file: {error}"
        )

    # -----------------------------------------------------
    # Resize
    # -----------------------------------------------------

    image = image.resize(
        IMAGE_SIZE
    )

    # -----------------------------------------------------
    # Convert to numpy
    # -----------------------------------------------------

    image_array = np.array(
        image,
        dtype=np.float32
    )

    # Add batch dimension
    image_array = np.expand_dims(
        image_array,
        axis=0
    )

    # IMPORTANT:
    # Do NOT use MobileNetV2 preprocess_input()
    # because the trained model handles its own
    # preprocessing/rescaling.
    # -----------------------------------------------------

    # -----------------------------------------------------
    # Prediction
    # -----------------------------------------------------

    predictions = model.predict(
        image_array,
        verbose=0
    )[0]

    # -----------------------------------------------------
    # Top prediction
    # -----------------------------------------------------

    best_index = int(
        np.argmax(predictions)
    )

    predicted_class = class_names[
        best_index
    ]

    confidence = float(
        predictions[best_index] * 100
    )

    # -----------------------------------------------------
    # Status
    # -----------------------------------------------------

    if "healthy" in predicted_class.lower():
        status = "Healthy"
    else:
        status = "Disease Detected"

    # -----------------------------------------------------
    # Health score
    # -----------------------------------------------------

    health_score = calculate_health_score(
        predicted_class,
        confidence
    )

    # -----------------------------------------------------
    # Recommendation
    # -----------------------------------------------------

    recommendation = RECOMMENDATIONS.get(
        predicted_class,
        "Monitor the crop regularly and consult an agricultural expert if symptoms continue."
    )

    # -----------------------------------------------------
    # Top 3 predictions
    # -----------------------------------------------------

    top_indices = np.argsort(
        predictions
    )[::-1][:3]

    top_predictions = []

    for index in top_indices:

        top_predictions.append({
            "disease": class_names[int(index)],
            "confidence": round(
                float(predictions[index] * 100),
                2
            )
        })

    # -----------------------------------------------------
    # Result
    # -----------------------------------------------------

    return {
        "success": True,
        "crop": extract_crop_name(
            predicted_class
        ),
        "status": status,
        "disease": predicted_class,
        "confidence": round(
            confidence,
            2
        ),
        "health_score": health_score,
        "recommendation": recommendation,
        "top_predictions": top_predictions
    }


# =========================================================
# CROP NAME
# =========================================================

def extract_crop_name(
    class_name: str
) -> str:

    if class_name.startswith("Tomato"):
        return "Tomato"

    if class_name.startswith("Potato"):
        return "Potato"

    if class_name.startswith("Pepper"):
        return "Pepper"

    return "Unknown"