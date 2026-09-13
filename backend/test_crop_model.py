import os
import json
import numpy as np
import tensorflow as tf
from PIL import Image


# =========================================================
# CONFIGURATION
# =========================================================

MODEL_PATH = "models/crop_health_model.keras"
CLASS_NAMES_PATH = "models/class_names.json"

IMAGE_SIZE = (224, 224)


# =========================================================
# LOAD MODEL
# =========================================================

def load_model_and_classes():

    print("\n" + "=" * 70)
    print("             CROP HEALTH AI MODEL TEST")
    print("=" * 70)

    # Check model
    if not os.path.exists(MODEL_PATH):
        print(f"\n❌ ERROR: Model not found!")
        print(f"Expected path: {MODEL_PATH}")
        exit()

    # Check class names
    if not os.path.exists(CLASS_NAMES_PATH):
        print(f"\n❌ ERROR: Class names file not found!")
        print(f"Expected path: {CLASS_NAMES_PATH}")
        exit()

    print("\n🔄 Loading trained model...")

    model = tf.keras.models.load_model(MODEL_PATH)

    print("✅ Model loaded successfully.")

    # Load class names
    with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as file:
        class_names = json.load(file)

    print(f"✅ Classes loaded: {len(class_names)}")

    return model, class_names


# =========================================================
# LOAD IMAGE
# =========================================================

def load_image(image_path):

    if not os.path.exists(image_path):

        print("\n❌ ERROR: Image not found!")
        print(f"Path: {image_path}")

        return None

    try:

        image = Image.open(image_path)

        print("\n📷 IMAGE INFORMATION")
        print("-" * 70)
        print(f"Original format : {image.format}")
        print(f"Original size   : {image.size}")
        print(f"Image mode      : {image.mode}")

        # Convert to RGB
        image = image.convert("RGB")

        # Resize
        image = image.resize(IMAGE_SIZE)

        print(f"Model input     : {IMAGE_SIZE}")
        print("-" * 70)

        return image

    except Exception as error:

        print(f"\n❌ ERROR while loading image:")
        print(error)

        return None


# =========================================================
# PREDICTION
# =========================================================

def predict_image(model, class_names, image):

    # Convert PIL image to numpy
    image_array = np.array(
        image,
        dtype=np.float32
    )

    # Add batch dimension
    image_array = np.expand_dims(
        image_array,
        axis=0
    )

    # =====================================================
    # IMPORTANT
    # =====================================================
    #
    # DO NOT use:
    #
    # tf.keras.applications.mobilenet_v2.preprocess_input()
    #
    # here.
    #
    # The trained model already contains the rescaling
    # layer used during training.
    #
    # =====================================================

    print("\n🔍 Running AI prediction...")

    predictions = model.predict(
        image_array,
        verbose=0
    )[0]

    # Sort predictions from highest to lowest
    sorted_indices = np.argsort(
        predictions
    )[::-1]

    # =====================================================
    # TOP 5 PREDICTIONS
    # =====================================================

    print("\n" + "=" * 70)
    print("                    TOP 5 PREDICTIONS")
    print("=" * 70)

    top_5_indices = sorted_indices[:5]

    for rank, index in enumerate(
        top_5_indices,
        start=1
    ):

        class_name = class_names[index]

        confidence = (
            float(predictions[index]) * 100
        )

        print(
            f"{rank}. "
            f"{class_name:<50} "
            f"{confidence:>7.2f}%"
        )

    print("=" * 70)

    # =====================================================
    # FINAL PREDICTION
    # =====================================================

    best_index = sorted_indices[0]

    best_class = class_names[best_index]

    best_confidence = (
        float(predictions[best_index]) * 100
    )

    # =====================================================
    # STATUS
    # =====================================================

    if "healthy" in best_class.lower():

        status = "Healthy"

    else:

        status = "Disease Detected"

    # =====================================================
    # DISPLAY FINAL RESULT
    # =====================================================

    print("\n" + "=" * 70)
    print("                    FINAL RESULT")
    print("=" * 70)

    print(f"\n🌱 Prediction : {best_class}")
    print(f"📊 Confidence : {best_confidence:.2f}%")
    print(f"🩺 Status     : {status}")

    print("\n" + "=" * 70)


# =========================================================
# MAIN
# =========================================================

def main():

    model, class_names = load_model_and_classes()

    print("\nAvailable classes:")

    for number, class_name in enumerate(
        class_names,
        start=1
    ):

        print(
            f"{number:2}. {class_name}"
        )

    print("\n" + "-" * 70)

    image_path = input(
        "\n📂 Enter leaf image path: "
    ).strip().strip('"')

    image = load_image(image_path)

    if image is None:
        return

    predict_image(
        model,
        class_names,
        image
    )


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":
    main()