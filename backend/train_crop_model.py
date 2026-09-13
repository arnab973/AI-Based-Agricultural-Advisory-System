import os
import json
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau

# =========================================================
# CONFIG
# =========================================================

DATASET_DIR = "dataset"
MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "crop_health_model.keras")

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 15
VALIDATION_SPLIT = 0.20
SEED = 42

os.makedirs(MODEL_DIR, exist_ok=True)

print("=" * 60)
print("CROP HEALTH AI MODEL TRAINING")
print("=" * 60)

# =========================================================
# LOAD DATASET
# =========================================================

print("\nLoading dataset...")

train_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=VALIDATION_SPLIT,
    subset="training",
    seed=SEED,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="int"
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=VALIDATION_SPLIT,
    subset="validation",
    seed=SEED,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="int"
)

class_names = train_ds.class_names
num_classes = len(class_names)

print("\nClasses:")
for i, name in enumerate(class_names):
    print(f"{i}: {name}")

print(f"\nTotal classes: {num_classes}")

# =========================================================
# SAVE CLASS NAMES
# =========================================================

class_names_path = os.path.join(MODEL_DIR, "class_names.json")

with open(class_names_path, "w", encoding="utf-8") as f:
    json.dump(class_names, f, indent=4)

print(f"\nClass names saved to: {class_names_path}")

# =========================================================
# PERFORMANCE
# =========================================================

AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)

# =========================================================
# DATA AUGMENTATION
# =========================================================

data_augmentation = keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.15),
    layers.RandomZoom(0.15),
    layers.RandomContrast(0.10),
], name="data_augmentation")

# =========================================================
# BASE MODEL - MOBILENETV2
# =========================================================

print("\nLoading MobileNetV2...")

base_model = MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)

# Freeze pretrained layers initially
base_model.trainable = False

# =========================================================
# BUILD MODEL
# =========================================================

inputs = keras.Input(shape=(224, 224, 3))

x = data_augmentation(inputs)

x = layers.Rescaling(
    scale=1.0 / 127.5,
    offset=-1
)(x)

x = base_model(x, training=False)

x = layers.GlobalAveragePooling2D()(x)

x = layers.Dropout(0.30)(x)

x = layers.Dense(
    128,
    activation="relu"
)(x)

x = layers.Dropout(0.20)(x)

outputs = layers.Dense(
    num_classes,
    activation="softmax"
)(x)

model = keras.Model(inputs, outputs)

# =========================================================
# COMPILE
# =========================================================

model.compile(
    optimizer=keras.optimizers.Adam(
        learning_rate=0.0001
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# =========================================================
# CALLBACKS
# =========================================================

callbacks = [

    ModelCheckpoint(
        MODEL_PATH,
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1
    ),

    EarlyStopping(
        monitor="val_accuracy",
        patience=4,
        restore_best_weights=True,
        verbose=1
    ),

    ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.3,
        patience=2,
        min_lr=1e-7,
        verbose=1
    )
]

# =========================================================
# TRAIN
# =========================================================

print("\nStarting training...\n")

history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    callbacks=callbacks
)

# =========================================================
# SAVE FINAL MODEL
# =========================================================

model.save(MODEL_PATH)

print("\n" + "=" * 60)
print("TRAINING COMPLETED!")
print("=" * 60)

print(f"\nModel saved at:")
print(MODEL_PATH)

print(f"\nClasses saved at:")
print(class_names_path)

print("\nCrop Health AI model is ready! 🌱")