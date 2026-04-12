from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], bcrypt__rounds=12, truncate_error=True)
def hash_password(password:str):
    return pwd_context.hash(password)

def verify_password(plain,hashed):
    return pwd_context.verify(plain,hashed)


