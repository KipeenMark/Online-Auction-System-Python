from functools import wraps
from flask import jsonify
from bson import ObjectId
from datetime import datetime

class APIError(Exception):
    """Base class for API errors"""
    def __init__(self, message, status_code=400):
        super().__init__()
        self.message = message
        self.status_code = status_code

    def to_dict(self):
        return {'error': self.message}

def handle_api_error(error):
    """Error handler for APIError exceptions"""
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

def serialize_mongo_doc(doc):
    """Serialize MongoDB document to JSON-compatible format"""
    if isinstance(doc, dict):
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                doc[key] = str(value)
            elif isinstance(value, datetime):
                # Ensure datetime is timezone aware before serializing
                if value.tzinfo is None:
                    value = value.replace(tzinfo=datetime.now().astimezone().tzinfo)
                doc[key] = value.isoformat()
            elif isinstance(value, list):
                doc[key] = [serialize_mongo_doc(item) for item in value]
            elif isinstance(value, dict):
                doc[key] = serialize_mongo_doc(value)
        return doc
    elif isinstance(doc, list):
        return [serialize_mongo_doc(item) for item in doc]
    elif isinstance(doc, ObjectId):
        return str(doc)
    elif isinstance(doc, datetime):
        return doc.isoformat()
    return doc

def validate_auction_data(data):
    """Validate auction creation data"""
    print("Validating auction data:", {k: v for k, v in data.items() if k != 'imageUrl'})
    
    # Check required fields
    required_fields = ['title', 'description', 'startingPrice', 'minimumIncrement', 'endTime']
    for field in required_fields:
        if field not in data:
            raise APIError(f"Missing required field: {field}")
        elif not str(data[field]).strip():  # Check for empty values
            raise APIError(f"Field cannot be empty: {field}")

    # Validate numeric fields
    try:
        starting_price = float(data['startingPrice'])
        if starting_price <= 0:
            raise APIError("Starting price must be greater than 0")
    except (ValueError, TypeError):
        raise APIError("Starting price must be a valid number", 422)
        
    try:
        minimum_increment = float(data['minimumIncrement'])
        if minimum_increment <= 0:
            raise APIError("Minimum increment must be greater than 0")
    except (ValueError, TypeError):
        raise APIError("Minimum increment must be a valid number", 422)

    # Validate endTime
    try:
        # Parse end time and ensure it's timezone aware
        end_time = datetime.fromisoformat(data['endTime'].replace('Z', '+00:00'))
        now = datetime.now(end_time.tzinfo)  # Get current time with same timezone
        if end_time <= now:
            raise APIError("End time must be in the future")
    except ValueError:
        raise APIError("Invalid end time format", 422)

def validate_bid_data(data, current_bid):
    """Validate bid data"""
    if 'amount' not in data:
        raise APIError("Missing bid amount")
    
    try:
        bid_amount = float(data['amount'])
        
        # Validate bid amount is a positive number
        if bid_amount <= 0:
            raise APIError("Bid amount must be greater than 0")
        
        # Validate bid amount is higher than current bid
        if current_bid and bid_amount <= current_bid:
            raise APIError(f"Bid must be higher than current bid (${current_bid})")
            
    except (ValueError, TypeError):
        raise APIError("Bid amount must be a valid number")

def validate_user_data(data):
    """Validate user registration data"""
    required_fields = ['firstName', 'lastName', 'email', 'phone', 'password']
    for field in required_fields:
        if field not in data:
            raise APIError(f"Missing required field: {field}")
    
    if len(data['password']) < 6:
        raise APIError("Password must be at least 6 characters long")
    
    # Basic email validation
    if '@' not in data['email'] or '.' not in data['email']:
        raise APIError("Invalid email format")

class DatabaseConnection:
    """Context manager for database operations"""
    def __init__(self, db):
        self.db = db
    
    def __enter__(self):
        return self.db
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            # Log the error here if needed
            return False
        return True

def with_database(func):
    """Decorator to handle database operations"""
    @wraps(func)
    def wrapper(db, *args, **kwargs):
        with DatabaseConnection(db) as database:
            return func(database, *args, **kwargs)
    return wrapper

@with_database
def find_user_by_email(db, email):
    """Find user by email"""
    return db.users.find_one({'email': email})

@with_database
def find_auction_by_id(db, auction_id):
    """Find auction by ID"""
    try:
        return db.auctions.find_one({'_id': ObjectId(auction_id)})
    except:
        raise APIError("Invalid auction ID", 404)

@with_database
def get_user_auctions(db, user_id):
    """Get all auctions for a user"""
    try:
        # Clean and validate the user ID format
        try:
            clean_user_id = str(user_id).strip()
            object_id = ObjectId(clean_user_id)
            auctions = list(db.auctions.find({'seller_id': object_id}))
        except Exception as e:
            raise APIError(f"Invalid user ID format: {clean_user_id}", 422)
        return [serialize_mongo_doc(auction) for auction in auctions]
    except APIError as e:
        raise e
    except Exception as e:
        raise APIError(f"Error retrieving user auctions: {str(e)}", 500)

@with_database
def get_user_bids(db, user_id):
    """Get all bids for a user"""
    try:
        auctions = list(db.auctions.find({
            'bids.user_id': ObjectId(user_id)
        }))
        return [serialize_mongo_doc(auction) for auction in auctions]
    except:
        raise APIError("Error retrieving user bids", 500)