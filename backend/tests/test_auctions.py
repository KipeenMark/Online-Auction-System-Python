import unittest
from flask import json
from app import app
from models import User, Auction
from datetime import datetime, timedelta
import mongomock
from flask_jwt_extended import create_access_token

class TestAuctions(unittest.TestCase):
    def setUp(self):
        # Configure app for testing
        app.config['TESTING'] = True
        app.config['JWT_SECRET_KEY'] = 'test-secret-key'
        
        # Create mock MongoDB client
        self.mongo_client = mongomock.MongoClient()
        self.db = self.mongo_client.auction_system
        
        # Get test client
        self.client = app.test_client()
        
        # Create test user
        self.user_id = str(self.db.users.insert_one({
            'firstName': 'Test',
            'lastName': 'User',
            'email': 'test@example.com',
            'password': 'hashed_password'
        }).inserted_id)
        
        # Create access token for test user
        self.access_token = create_access_token(identity=self.user_id)
        self.headers = {'Authorization': f'Bearer {self.access_token}'}
        
        # Sample auction data
        self.auction_data = {
            'title': 'Test Auction',
            'description': 'Test description',
            'startingPrice': 100.0,
            'endTime': (datetime.utcnow() + timedelta(days=7)).isoformat(),
            'imageUrl': 'https://example.com/image.jpg'
        }

    def test_create_auction_success(self):
        """Test successful auction creation"""
        response = self.client.post(
            '/api/auctions',
            data=json.dumps(self.auction_data),
            content_type='application/json',
            headers=self.headers
        )
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['title'], self.auction_data['title'])
        self.assertEqual(response.json['current_bid'], self.auction_data['startingPrice'])

    def test_create_auction_invalid_data(self):
        """Test auction creation with invalid data"""
        invalid_data = self.auction_data.copy()
        invalid_data.pop('title')  # Remove required field
        
        response = self.client.post(
            '/api/auctions',
            data=json.dumps(invalid_data),
            content_type='application/json',
            headers=self.headers
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('Missing required field', response.json['error'])

    def test_create_auction_unauthorized(self):
        """Test auction creation without authentication"""
        response = self.client.post(
            '/api/auctions',
            data=json.dumps(self.auction_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 401)

    def test_get_auctions(self):
        """Test getting all auctions"""
        # Create some test auctions
        self.db.auctions.insert_many([
            {
                'title': 'Auction 1',
                'description': 'Description 1',
                'current_bid': 100.0,
                'end_time': datetime.utcnow() + timedelta(days=1)
            },
            {
                'title': 'Auction 2',
                'description': 'Description 2',
                'current_bid': 200.0,
                'end_time': datetime.utcnow() + timedelta(days=2)
            }
        ])
        
        response = self.client.get('/api/auctions')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json), 2)

    def test_get_auction_by_id(self):
        """Test getting a specific auction"""
        # Create test auction
        auction_id = str(self.db.auctions.insert_one({
            'title': 'Test Auction',
            'description': 'Test Description',
            'current_bid': 100.0,
            'end_time': datetime.utcnow() + timedelta(days=1)
        }).inserted_id)
        
        response = self.client.get(f'/api/auctions/{auction_id}')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['title'], 'Test Auction')

    def test_place_bid_success(self):
        """Test successful bid placement"""
        # Create test auction
        auction_id = str(self.db.auctions.insert_one({
            'title': 'Test Auction',
            'description': 'Test Description',
            'current_bid': 100.0,
            'end_time': datetime.utcnow() + timedelta(days=1),
            'bids': []
        }).inserted_id)
        
        bid_data = {'amount': 150.0}
        
        response = self.client.post(
            f'/api/auctions/{auction_id}/bid',
            data=json.dumps(bid_data),
            content_type='application/json',
            headers=self.headers
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('Bid placed successfully', response.json['message'])

    def test_place_bid_invalid_amount(self):
        """Test bid placement with invalid amount"""
        auction_id = str(self.db.auctions.insert_one({
            'title': 'Test Auction',
            'description': 'Test Description',
            'current_bid': 100.0,
            'end_time': datetime.utcnow() + timedelta(days=1),
            'bids': []
        }).inserted_id)
        
        bid_data = {'amount': 50.0}  # Lower than current bid
        
        response = self.client.post(
            f'/api/auctions/{auction_id}/bid',
            data=json.dumps(bid_data),
            content_type='application/json',
            headers=self.headers
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('Bid must be higher than current bid', response.json['error'])

    def test_place_bid_auction_ended(self):
        """Test bid placement on ended auction"""
        auction_id = str(self.db.auctions.insert_one({
            'title': 'Test Auction',
            'description': 'Test Description',
            'current_bid': 100.0,
            'end_time': datetime.utcnow() - timedelta(days=1),  # Ended auction
            'bids': []
        }).inserted_id)
        
        bid_data = {'amount': 150.0}
        
        response = self.client.post(
            f'/api/auctions/{auction_id}/bid',
            data=json.dumps(bid_data),
            content_type='application/json',
            headers=self.headers
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('Auction has ended', response.json['error'])

if __name__ == '__main__':
    unittest.main()