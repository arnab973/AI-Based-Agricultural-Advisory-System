from fastapi import APIRouter, File, HTTPException, UploadFile

from .service import predict_crop_health


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/crop-health",
    tags=["Crop Health"]
)


# =========================================================
# PREDICT
# =========================================================

@router.post("/predict")
async def predict_crop(
    file: UploadFile = File(...)
):

    # -----------------------------------------------------
    # Validate file
    # -----------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No image file provided."
        )

    allowed_types = {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid image format. "
                "Please upload JPG, PNG or WEBP."
            )
        )

    # -----------------------------------------------------
    # Read image
    # -----------------------------------------------------

    try:

        image_bytes = await file.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty."
            )

        # -------------------------------------------------
        # Prediction
        # -------------------------------------------------

        result = predict_crop_health(
            image_bytes
        )

        # Add original filename
        result["filename"] = file.filename

        return result

    except HTTPException:
        raise

    except Exception as error:

        print(
            f"❌ Crop health prediction error: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Crop health prediction failed."
            )
        )