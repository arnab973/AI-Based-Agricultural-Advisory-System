from sqlalchemy.orm import Session
import models
import schemas


# =====================================================
# CREATE USER
# =====================================================

def create_user(
    db: Session,
    user: schemas.UserCreate
):
    existing_user = db.query(
        models.User
    ).filter(
        models.User.email == user.email
    ).first()

    if existing_user:
        return None

    new_user = models.User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=user.password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# =====================================================
# LOGIN USER
# =====================================================

def login_user(
    db: Session,
    user: schemas.UserLogin
):
    return db.query(
        models.User
    ).filter(
        models.User.email == user.email,
        models.User.password == user.password
    ).first()


# =====================================================
# GET USER PROFILE
# =====================================================

def get_user_profile(
    db: Session,
    user_id: int
):
    return db.query(
        models.User
    ).filter(
        models.User.id == user_id
    ).first()


# =====================================================
# UPDATE USER PROFILE
# =====================================================

def update_user_profile(
    db: Session,
    user_id: int,
    profile: schemas.UserProfileUpdate
):
    user = get_user_profile(
        db,
        user_id
    )

    if user is None:
        return None

    existing_user = db.query(
        models.User
    ).filter(
        models.User.email == profile.email,
        models.User.id != user_id
    ).first()

    if existing_user:
        return "EMAIL_EXISTS"

    user.first_name = profile.first_name
    user.last_name = profile.last_name or ""
    user.email = profile.email

    db.commit()
    db.refresh(user)

    return user


# =====================================================
# UPDATE PROFILE IMAGE
# =====================================================

def update_profile_image(
    db: Session,
    user_id: int,
    image_url: str
):
    user = get_user_profile(
        db,
        user_id
    )

    if user is None:
        return None

    user.profile_image = image_url

    db.commit()
    db.refresh(user)

    return user


# =====================================================
# REMOVE PROFILE IMAGE
# =====================================================

def remove_profile_image(
    db: Session,
    user_id: int
):
    user = get_user_profile(
        db,
        user_id
    )

    if user is None:
        return None

    user.profile_image = None

    db.commit()
    db.refresh(user)

    return user