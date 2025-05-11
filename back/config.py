import secrets
print(secrets.token_hex(32))
SECRET_KEY = secrets.token_hex(32)
DATABASE_URL = 'postgresql://postgres:root@localhost/users'