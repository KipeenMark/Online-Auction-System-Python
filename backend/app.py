from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timedelta
import os
import bcrypt

from models import User, Auction, Bid
from utils import (
    APIError, handle_api_error, serialize_mongo_doc,
    validate_auction_data, validate_bid_data, validate_user_data,
    find_user_by_email, find_auction_by_id, get_user_auctions, get_user_bids
)

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure maximum request size (16MB)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')  # Change this in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
jwt = JWTManager(app)

# Connect to MongoDB
client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
db = client.auction_system

# Register error handler
app.register_error_handler(APIError, handle_api_error)

# User Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        validate_user_data(data)
        
        # Check if user already exists
        if find_user_by_email(db, data['email']):
            raise APIError('Email already registered', 400)
        
        # Create new user
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        user = User(
            data['firstName'],
            data['lastName'],
            data['email'],
            data['phone'],
            hashed_password
        )
        
        db.users.insert_one(user.to_dict())
        return jsonify({'message': 'User registered successfully'}), 201
        
    except APIError as e:
        raise e
    except Exception as e:
        raise APIError(str(e), 500)

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = find_user_by_email(db, data['email'])
        
        if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
            raise APIError('Invalid credentials', 401)
        
        access_token = create_access_token(identity=str(user['_id']))
        return jsonify({
            'access_token': access_token,
            'user': {
                '_id': str(user['_id']),  # Changed from 'id' to '_id' to match MongoDB
                'firstName': user['firstName'],
                'lastName': user['lastName'],
                'email': user['email']
            }
        })
        
    except APIError as e:
        raise e
    except Exception as e:
        raise APIError(str(e), 500)

# Auction Routes
@app.route('/api/auctions', methods=['GET'])
def get_auctions():
    try:
        auctions = list(db.auctions.find())
        return jsonify(serialize_mongo_doc(auctions))
    except Exception as e:
        raise APIError(str(e), 500)

@app.route('/api/auctions/<id>', methods=['GET'])
def get_auction(id):
    try:
        auction = find_auction_by_id(db, id)
        if not auction:
            raise APIError('Auction not found', 404)
        return jsonify(serialize_mongo_doc(auction))
    except APIError as e:
        raise e
    except Exception as e:
        raise APIError(str(e), 500)

@app.route('/api/auctions', methods=['POST'])
@jwt_required()
def create_auction():
    try:
        data = request.get_json()
        print("Received auction data:", {
            k: v[:50] + '...' if k == 'imageUrl' and isinstance(v, str) and len(v) > 50 else v
            for k, v in data.items()
        })
        
        validate_auction_data(data)
        user_id = get_jwt_identity()
        
        # Strip data URL prefix if present
        image_url = data.get('imageUrl', '')
        if not image_url:
            raise APIError("Image URL is required", 422)
            
        if image_url.startswith('data:'):
            parts = image_url.split(',')
            if len(parts) != 2:
                raise APIError("Invalid image data format", 422)
            image_url = parts[1]
            
        try:
            auction = Auction(
                data['title'],
                data['description'],
                float(data['startingPrice']),
                float(data['minimumIncrement']),
                datetime.fromisoformat(data['endTime'].replace('Z', '+00:00')),
                image_url,
                user_id,
            )
        except Exception as e:
            print(f"Error creating auction object: {str(e)}")
            print(f"Received data: {data}")
            raise APIError(f"Invalid auction data: {str(e)}", 422)
        
        result = db.auctions.insert_one(auction.to_dict())
        created_auction = find_auction_by_id(db, result.inserted_id)
        return jsonify(serialize_mongo_doc(created_auction)), 201
        
    except APIError as e:
        raise e
    except Exception as e:
        raise APIError(str(e), 500)

@app.route('/api/auctions/<id>/bid', methods=['POST'])
@jwt_required()
def place_bid(id):
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        
        auction = find_auction_by_id(db, id)
        if not auction:
            raise APIError('Auction not found', 404)
            
        if auction['end_time'] < datetime.utcnow():
            raise APIError('Auction has ended', 400)
            
        validate_bid_data(data, auction['current_bid'])
        
        bid = Bid(user_id, data['amount'])
        
        db.auctions.update_one(
            {'_id': auction['_id']},
            {
                '$push': {'bids': bid.to_dict()},
                '$set': {'current_bid': bid.amount}
            }
        )
        
        return jsonify({'message': 'Bid placed successfully'}), 200
        
    except APIError as e:
        raise e
    except Exception as e:
        raise APIError(str(e), 500)

@app.route('/api/users/<id>/auctions', methods=['GET'])
@jwt_required()
def get_user_auctions_route(id):
    try:
        auctions = get_user_auctions(db, id)
        return jsonify(auctions)
    except APIError as e:
        raise e
    except Exception as e:
        raise APIError(str(e), 500)

@app.route('/api/users/<id>/bids', methods=['GET'])
@jwt_required()
def get_user_bids_route(id):
    try:
        bids = get_user_bids(db, id)
        return jsonify(bids)
    except APIError as e:
        raise e
    except Exception as e:
        raise APIError(str(e), 500)

if __name__ == '__main__':
    app.run(debug=True)