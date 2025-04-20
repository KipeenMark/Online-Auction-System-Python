from datetime import datetime
from bson import ObjectId

class User:
    def __init__(self, first_name, last_name, email, phone, password_hash):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.phone = phone
        self.password = password_hash
        self.created_at = datetime.utcnow()
        self.rating = 0 
        self.total_sales = 0

    def to_dict(self):
        return {
            'firstName': self.first_name,
            'lastName': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'password': self.password,
            'created_at': self.created_at,
            'rating': self.rating,
            'total_sales': self.total_sales
        }

class Auction:
    def __init__(self, title, description, starting_price, minimum_increment, end_time, seller_id, image_url=None):
        self.title = title
        self.description = description
        self.starting_price = float(starting_price)
        self.minimum_increment = float(minimum_increment)
        self.current_bid = float(starting_price)
        # Ensure end_time is UTC
        if isinstance(end_time, str):
            self.end_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        else:
            self.end_time = end_time
        self.image_url = image_url
        # Convert seller_id to ObjectId if it's not already one
        self.seller_id = seller_id if isinstance(seller_id, ObjectId) else ObjectId(str(seller_id))
        # Ensure created_at is UTC
        self.created_at = datetime.now(self.end_time.tzinfo)
        self.bids = []

    def to_dict(self):
        return {
            'title': self.title,
            'description': self.description,
            'starting_price': self.starting_price,
            'minimum_increment': self.minimum_increment,
            'current_bid': self.current_bid,
            'end_time': self.end_time,
            'image_url': self.image_url,
            'seller_id': self.seller_id,
            'created_at': self.created_at,
            'bids': self.bids
        }

class Bid:
    def __init__(self, user_id, amount):
        self.user_id = ObjectId(user_id)
        self.amount = float(amount)
        self.time = datetime.utcnow()

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'amount': self.amount,
            'time': self.time
        }