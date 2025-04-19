import unittest
from flask import json
from app import app
from models import User
from datetime import datetime
import mongomock

class TestAuth(unittest.TestCase):
    def setUp(self):
        # Configure app for testing
        app.config['TESTING'] = True
        app.config['JWT_SECRET_KEY'] = 'test-secret-key'
        
        # Create mock MongoDB client
        self.mongo_client = mongomock.MongoClient()
        self.db = self.mongo_client.auction_system
        
        # Get test client
        self.client = app.test_client()
        
        # Sample user data
        self.user_data = {
            'firstName': 'Test',
            'lastName': 'User',
            'email': 'test@example.com',
            'phone': '1234567890',
            'password': 'testpass123'
        }

    def test_register_success(self):
        """Test successful user registration"""
        response = self.client.post(
            '/api/auth/register',
            data=json.dumps(self.user_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        self.assertIn('User registered successfully', response.json['message'])

    def test_register_duplicate_email(self):
        """Test registration with duplicate email"""
        # First registration
        self.client.post(
            '/api/auth/register',
            data=json.dumps(self.user_data),
            content_type='application/json'
        )
        
        # Second registration with same email
        response = self.client.post(
            '/api/auth/register',
            data=json.dumps(self.user_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('Email already registered', response.json['error'])

    def test_register_invalid_data(self):
        """Test registration with invalid data"""
        invalid_data = self.user_data.copy()
        invalid_data.pop('email')  # Remove required field
        
        response = self.client.post(
            '/api/auth/register',
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('Missing required field', response.json['error'])

    def test_login_success(self):
        """Test successful login"""
        # Register user first
        self.client.post(
            '/api/auth/register',
            data=json.dumps(self.user_data),
            content_type='application/json'
        )
        
        # Try to login
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps({
                'email': self.user_data['email'],
                'password': self.user_data['password']
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('access_token', response.json)
        self.assertIn('user', response.json)

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps({
                'email': 'wrong@example.com',
                'password': 'wrongpass'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 401)
        self.assertIn('Invalid credentials', response.json['error'])

if __name__ == '__main__':
    unittest.main()