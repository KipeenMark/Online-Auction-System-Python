import pytest
from datetime import datetime, timedelta
from flask import json
from app import app
import mongomock
from flask_jwt_extended import create_access_token

@pytest.fixture
def client():
    """Test client fixture"""
    app.config['TESTING'] = True
    app.config['JWT_SECRET_KEY'] = 'test-secret-key'
    return app.test_client()

@pytest.fixture
def mock_db():
    """Mock MongoDB fixture"""
    client = mongomock.MongoClient()
    return client.auction_system

@pytest.fixture
def test_user(mock_db):
    """Create test user and return user data"""
    user_data = {
        'firstName': 'Test',
        'lastName': 'User',
        'email': 'test@example.com',
        'phone': '1234567890',
        'password': 'testpass123'
    }
    user_id = mock_db.users.insert_one({
        **user_data,
        'password': b'hashed_password',  # Mocked hashed password
        'created_at': datetime.utcnow(),
        'rating': 0,
        'total_sales': 0
    }).inserted_id
    
    return {
        'id': str(user_id),
        **user_data
    }

@pytest.fixture
def auth_headers(test_user):
    """Generate authentication headers with JWT token"""
    access_token = create_access_token(identity=test_user['id'])
    return {'Authorization': f'Bearer {access_token}'}

@pytest.fixture
def test_auction(mock_db, test_user):
    """Create test auction and return auction data"""
    auction_data = {
        'title': 'Test Auction',
        'description': 'Test description',
        'starting_price': 100.0,
        'current_bid': 100.0,
        'end_time': datetime.utcnow() + timedelta(days=7),
        'image_url': 'https://example.com/image.jpg',
        'seller_id': test_user['id'],
        'created_at': datetime.utcnow(),
        'bids': []
    }
    auction_id = mock_db.auctions.insert_one(auction_data).inserted_id
    return {
        'id': str(auction_id),
        **auction_data
    }

@pytest.fixture
def make_bid_request(client, auth_headers):
    """Helper function to make bid requests"""
    def _make_bid_request(auction_id, amount):
        return client.post(
            f'/api/auctions/{auction_id}/bid',
            data=json.dumps({'amount': amount}),
            content_type='application/json',
            headers=auth_headers
        )
    return _make_bid_request

class TestUtils:
    @staticmethod
    def create_test_auction(mock_db, seller_id, **kwargs):
        """Create a test auction with custom data"""
        auction_data = {
            'title': kwargs.get('title', 'Test Auction'),
            'description': kwargs.get('description', 'Test description'),
            'starting_price': kwargs.get('starting_price', 100.0),
            'current_bid': kwargs.get('current_bid', 100.0),
            'end_time': kwargs.get('end_time', datetime.utcnow() + timedelta(days=7)),
            'image_url': kwargs.get('image_url', 'https://example.com/image.jpg'),
            'seller_id': seller_id,
            'created_at': datetime.utcnow(),
            'bids': kwargs.get('bids', [])
        }
        auction_id = mock_db.auctions.insert_one(auction_data).inserted_id
        return str(auction_id)

    @staticmethod
    def create_test_user(mock_db, **kwargs):
        """Create a test user with custom data"""
        user_data = {
            'firstName': kwargs.get('firstName', 'Test'),
            'lastName': kwargs.get('lastName', 'User'),
            'email': kwargs.get('email', f'test{datetime.now().timestamp()}@example.com'),
            'phone': kwargs.get('phone', '1234567890'),
            'password': b'hashed_password',
            'created_at': datetime.utcnow(),
            'rating': kwargs.get('rating', 0),
            'total_sales': kwargs.get('total_sales', 0)
        }
        user_id = mock_db.users.insert_one(user_data).inserted_id
        return str(user_id)

@pytest.fixture
def test_utils():
    """Fixture to provide test utilities"""
    return TestUtils