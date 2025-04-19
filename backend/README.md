# Online Auction System Backend

A Flask-based REST API backend for the Online Auction System with MongoDB integration.

## Table of Contents
- [Setup](#setup)
- [Development](#development)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)

## Setup

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install required packages:
```bash
pip install -r requirements.txt
```

3. Set up MongoDB:
- Install MongoDB if not already installed
- Create a database named 'auction_system'
- Update MONGODB_URI in `.env` if needed

4. Configure environment variables:
- Copy `.env.example` to `.env`
- Update the values as needed:
```ini
MONGODB_URI=mongodb://localhost:27017/auction_system
JWT_SECRET_KEY=your-secret-key
FLASK_ENV=development
FLASK_APP=app.py
```

5. Run the application:
```bash
flask run
```

## Development

### Running in Debug Mode
```bash
flask run --debug
```

### Code Organization
- `app.py`: Main application file
- `config.py`: Configuration management
- `models.py`: Data models
- `utils.py`: Utility functions
- `tests/`: Test files

### Logging
- Logs are stored in `logs/auction_system.log`
- Log level is DEBUG in development, INFO in production
- Logs are rotated at 10MB with 5 backup files

## Testing

### Running Tests
```bash
# Run all tests
pytest

# Run tests with coverage report
pytest --cov=.

# Run specific test file
pytest tests/test_auth.py
```

### Test Structure
- `tests/test_auth.py`: Authentication tests
- `tests/test_auctions.py`: Auction functionality tests

### Mocking
- MongoDB is mocked using mongomock for tests
- JWT authentication is active during tests

## API Documentation

### Authentication

#### Register User
- **POST** `/api/auth/register`
- Body:
```json
{
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "password": "string"
}
```

#### Login
- **POST** `/api/auth/login`
- Body:
```json
{
    "email": "string",
    "password": "string"
}
```
- Returns: JWT token and user details

### Auctions

#### Get All Auctions
- **GET** `/api/auctions`
- Public endpoint
- Supports filtering and pagination

#### Get Single Auction
- **GET** `/api/auctions/<id>`
- Public endpoint

#### Create Auction
- **POST** `/api/auctions`
- Protected endpoint (requires JWT)
- Body:
```json
{
    "title": "string",
    "description": "string",
    "startingPrice": "number",
    "endTime": "ISO datetime",
    "imageUrl": "string"
}
```

#### Place Bid
- **POST** `/api/auctions/<id>/bid`
- Protected endpoint (requires JWT)
- Body:
```json
{
    "amount": "number"
}
```

### User Specific

#### Get User's Auctions
- **GET** `/api/users/<id>/auctions`
- Protected endpoint (requires JWT)

#### Get User's Bids
- **GET** `/api/users/<id>/bids`
- Protected endpoint (requires JWT)

## Project Structure
```
backend/
├── app.py
├── config.py
├── models.py
├── utils.py
├── requirements.txt
├── .env
├── logs/
│   └── auction_system.log
└── tests/
    ├── test_auth.py
    └── test_auctions.py
```

## Database Schema

### Users Collection
```javascript
{
    _id: ObjectId,
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    password: String (hashed),
    created_at: DateTime,
    rating: Number,
    total_sales: Number
}
```

### Auctions Collection
```javascript
{
    _id: ObjectId,
    title: String,
    description: String,
    starting_price: Number,
    current_bid: Number,
    end_time: DateTime,
    image_url: String,
    seller_id: ObjectId (ref: users),
    created_at: DateTime,
    bids: [
        {
            user_id: ObjectId (ref: users),
            amount: Number,
            time: DateTime
        }
    ]
}
```

## Error Handling

The API uses standardized error responses:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

Error Response Format:
```json
{
    "error": "Error message description"
}
```

## Authentication

Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Token expiration: 24 hours

## Monitoring and Maintenance

### Logging
- Application logs: `logs/auction_system.log`
- Access logs: Handled by Flask
- Error logs: Includes stack traces and request details

### Security
- Passwords are hashed using bcrypt
- JWT tokens are required for protected endpoints
- CORS is configured for frontend access
- Input validation on all endpoints

### Performance
- Database indexes on frequently queried fields
- Connection pooling for MongoDB
- Rate limiting on authentication endpoints