class config:
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class local(config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///database.sqlite3"
    DEBUG = True
    SECURITY_PASSWORD_HASH = "bcrypt"
    SECURITY_PASSWORD_SALT = "wowsecrettobypassattack"
    SECRET_KEY = "veryverysecretkey"
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "auth-token"

    #cache specification
    CACHE_TYPE = "RedisCache"
    CACHE_DEFAULT_TIMEOUT = 30
    CACHE_REDIS_PORT = 6379
    

    WTF_CSRF_ENABLED = False

