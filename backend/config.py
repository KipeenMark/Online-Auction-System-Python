import os
from datetime import timedelta
import logging
from logging.handlers import RotatingFileHandler

class Config:
    """Base configuration"""
    # Flask
    SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    
    # MongoDB
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
    DATABASE_NAME = 'auction_system'
    
    # Logging
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    LOG_LEVEL = logging.INFO
    LOG_FILE = 'logs/auction_system.log'
    LOG_MAX_SIZE = 10 * 1024 * 1024  # 10MB
    LOG_BACKUP_COUNT = 5

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    LOG_LEVEL = logging.DEBUG

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    
    # In production, ensure these are set in environment variables
    SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    MONGODB_URI = os.getenv('MONGODB_URI')

def get_config():
    """Get configuration based on environment"""
    env = os.getenv('FLASK_ENV', 'development')
    if env == 'production':
        return ProductionConfig
    return DevelopmentConfig

def setup_logging(app):
    """Configure logging"""
    config = app.config
    
    # Ensure logs directory exists
    os.makedirs('logs', exist_ok=True)
    
    # Create formatter
    formatter = logging.Formatter(config['LOG_FORMAT'])
    
    # File handler
    file_handler = RotatingFileHandler(
        config['LOG_FILE'],
        maxBytes=config['LOG_MAX_SIZE'],
        backupCount=config['LOG_BACKUP_COUNT']
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(config['LOG_LEVEL'])
    
    # Stream handler
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    stream_handler.setLevel(config['LOG_LEVEL'])
    
    # Configure app logger
    app.logger.addHandler(file_handler)
    app.logger.addHandler(stream_handler)
    app.logger.setLevel(config['LOG_LEVEL'])
    
    # Set werkzeug logger level
    logging.getLogger('werkzeug').setLevel(config['LOG_LEVEL'])

def init_app(app):
    """Initialize application configuration"""
    config = get_config()
    app.config.from_object(config)
    setup_logging(app)
    
    # Additional initialization can be added here
    return app