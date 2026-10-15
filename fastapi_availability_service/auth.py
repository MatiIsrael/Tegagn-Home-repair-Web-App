from typing import Optional
from fastapi import Header, HTTPException, status, Depends
from pydantic import BaseModel

class CurrentUser(BaseModel):
    user_id: str
    email: str
    role: str  # 'worker', 'customer', 'admin'


# ------------------------------------------------------------------------------
# MOCK TOKEN REGISTRY (Demonstrating Auth Concepts for Testing & Learning)
# In production, this would verify a cryptographically signed JWT via RS256/HS256.
# ------------------------------------------------------------------------------
DEV_TOKENS = {
    "worker-tadesse-key": CurrentUser(user_id="worker-tadesse", email="tadesse@example.com", role="worker"),
    "worker-sara-key": CurrentUser(user_id="worker-sara", email="sara@example.com", role="worker"),
    "customer-helen-key": CurrentUser(user_id="customer-helen", email="helen@example.com", role="customer"),
    "admin-master-key": CurrentUser(user_id="admin-01", email="admin@tegagn.com", role="admin"),
}


def get_current_user(authorization: Optional[str] = Header(None)) -> CurrentUser:
    """
    FastAPI Dependency: Extracts and validates the Bearer token from the HTTP Authorization header.
    Raises HTTP 401 Unauthorized if missing or invalid.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header. Use: 'Bearer <token>'"
        )

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme. Expected: 'Bearer <token>'"
        )

    # For educational simplicity, we check against our verified token registry
    # In a production environment with JWT: jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    user = DEV_TOKENS.get(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token."
        )

    return user


def require_worker(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    """FastAPI Dependency: Restricts access strictly to workers or administrators."""
    if user.role not in ["worker", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only registered trade service professionals can perform this action."
        )
    return user


def require_admin(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    """FastAPI Dependency: Restricts access strictly to administrators."""
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Platform administrator credentials required."
        )
    return user
