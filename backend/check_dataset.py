import os

DATASET_DIR = "dataset"

IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")

total_images = 0

print("\n========== CROP HEALTH DATASET ==========\n")

if not os.path.exists(DATASET_DIR):
    print("❌ dataset folder nahi mila!")
    print("Expected path: backend/dataset/")
    exit()

classes = sorted(
    folder
    for folder in os.listdir(DATASET_DIR)
    if os.path.isdir(os.path.join(DATASET_DIR, folder))
)

print(f"Total Classes: {len(classes)}\n")

for class_name in classes:
    class_path = os.path.join(DATASET_DIR, class_name)

    images = [
        file
        for file in os.listdir(class_path)
        if file.lower().endswith(IMAGE_EXTENSIONS)
    ]

    count = len(images)
    total_images += count

    print(f"{class_name:<55} {count:>5} images")

print("\n------------------------------------------")
print(f"TOTAL IMAGES: {total_images}")
print("------------------------------------------")

if len(classes) == 15:
    print("✅ 15 classes detected successfully!")
else:
    print(f"⚠️ Expected 15 classes, but found {len(classes)}.")

if total_images > 0:
    print("✅ Dataset is ready for inspection.")
else:
    print("❌ No images found!")