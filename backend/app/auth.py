import datetime
import os
import hashlib
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .database import get_db
from . import models

# Import JWT and Password hashing libraries, fallback to standard hashlib if missing
try:
    from jose import JWTError, jwt
    from passlib.context import CryptContext
    HAS_SECURITY_LIBS = True
except ImportError:
    HAS_SECURITY_LIBS = False

SECRET_KEY = os.getenv("JWT_SECRET", "tourismos_super_secret_sih_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 Hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

if HAS_SECURITY_LIBS:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    def verify_password(plain_password, hashed_password):
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            return hash_sha256(plain_password) == hashed_password
            
    def get_password_hash(password):
        return pwd_context.hash(password)
        
    def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.datetime.utcnow() + expires_delta
        else:
            expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    def decode_token(token: str):
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None
else:
    # Custom high-quality cryptographic fallback using standard hashlib
    def hash_sha256(password: str) -> str:
        return hashlib.sha256((password + SECRET_KEY).encode()).hexdigest()

    def verify_password(plain_password, hashed_password):
        return hash_sha256(plain_password) == hashed_password

    def get_password_hash(password):
        return hash_sha256(password)

    def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
        # Fallback pseudo-JWT token: base64-like representation of data + a signature hash
        exp_minutes = expires_delta.total_seconds() / 60 if expires_delta else 15
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=exp_minutes)
        payload = data.copy()
        payload["exp"] = expire.isoformat()
        
        # Simple format: username:role:exp_iso:signature
        payload_str = f"{payload.get('sub')}:{payload.get('role')}:{payload['exp']}"
        sig = hashlib.md5((payload_str + SECRET_KEY).encode()).hexdigest()
        return f"{payload_str}:{sig}"

    def decode_token(token: str):
        try:
            parts = token.split(":")
            if len(parts) != 4:
                return None
            username, role, exp_iso, sig = parts
            payload_str = f"{username}:{role}:{exp_iso}"
            expected_sig = hashlib.md5((payload_str + SECRET_KEY).encode()).hexdigest()
            if sig != expected_sig:
                return None
                
            # Check expiration
            exp_time = datetime.datetime.fromisoformat(exp_iso)
            if datetime.datetime.utcnow() > exp_time:
                return None
                
            return {"sub": username, "role": role}
        except Exception:
            return None

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

class RoleChecker:
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles

    def __call__(self, user: models.User = Depends(get_current_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{user.role}' is not authorized to access this resource. Allowed roles: {self.allowed_roles}"
            )
        return user
