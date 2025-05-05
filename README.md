# Tennis Players API

A Node.js REST API that provides information about tennis players with Redis caching for improved performance.

## Features

- RESTful API endpoints for tennis players data
- Redis caching for improved response times
- Error handling and logging
- Rate limiting for API protection
- Security features with Helmet
- CORS support
- Comprehensive test coverage
- Docker support for easy deployment

## Prerequisites

- Node.js (v22.x)
- Redis server
- npm (comes with Node.js)
- Docker and Docker Compose (for containerized deployment)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tennisPlayerStatus
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
NODE_ENV=development  # for production change this
PORT=3000
DATA_URL=<your-data-source-url>
REDIS_HOST=redis     # For docker use redis value and for running on local use localhost
REDIS_PORT=6379
```

## Project Structure

```
tennisPlayerStatus/
├── src/
│   ├── controllers/
│   │   └── playersController.js    # Handles player data logic
│   ├── routes/
│   │   └── players.js             # Defines API routes
│   ├── middlewares/
│   │   ├── errors.js              # Global error handling
│   │   ├── index.js               # Security and retelimiter middleware setup
│   └── utils/
│       ├── redisClient.js         # Redis connection and operations
│       └── logger.js              # Logging utility
├── tests/
│   ├── players.test.js            # API endpoint tests
│   └── __mocks__/                 # Test mocks
├── config/
│   └── index.js                   # Configuration management
├── app.js                         # Application entry point
├── package.json                   # Project dependencies
├── Dockerfile                     # Docker configuration
├── docker-compose.yml            # Docker services orchestration
└── README.md                      # Project documentation
```

## API Endpoints

### GET /players
Returns a list of all tennis players.

**Request:**
```http
GET /players
```

**Response:**
```json
[
  {
      "id": 52,
      "firstname": "Novak",
      "lastname": "Djokovic",
      "shortname": "N.DJO",
      "sex": "M",
      "country": {
        "picture":
          "https://i.eurosport.com/_iss_/geo/country/flag/medium/6944.png",
        "code": "SRB",
      },
      "picture":
        "https://i.eurosport.com/_iss_/person/pp_clubteam/large/565920.jpg",
      "data": {
        "rank": 2,
        "points": 2542,
        "weight": 80000,
        "height": 188,
        "age": 31,
        "last": [1, 1, 1, 1, 1],
      },
    },
  {
      "id": 52,
      "firstname": "Novak",
      "lastname": "Djokovic",
      "shortname": "N.DJO",
      "sex": "M",
      "country": {
        "picture":
          "https://i.eurosport.com/_iss_/geo/country/flag/medium/6944.png",
        "code": "SRB",
      },
      "picture":
        "https://i.eurosport.com/_iss_/person/pp_clubteam/large/565920.jpg",
      "data": {
        "rank": 2,
        "points": 2542,
        "weight": 80000,
        "height": 188,
        "age": 31,
        "last": [1, 1, 1, 1, 1],
      },
    }
]
```

**Error Response (500):**
```json
{
  "error": "Failed to fetch players data"
}
```

### GET /players/:id
Returns a specific tennis player by ID.

**Request:**
```http
GET /players/52
```

**Response:**
```json
{
      "id": 52,
      "firstname": "Novak",
      "lastname": "Djokovic",
      "shortname": "N.DJO",
      "sex": "M",
      "country": {
        "picture":
          "https://i.eurosport.com/_iss_/geo/country/flag/medium/6944.png",
        "code": "SRB",
      },
      "picture":
        "https://i.eurosport.com/_iss_/person/pp_clubteam/large/565920.jpg",
      "data": {
        "rank": 2,
        "points": 2542,
        "weight": 80000,
        "height": 188,
        "age": 31,
        "last": [1, 1, 1, 1, 1],
      },
    }
```

**Error Responses:**

404 - Player Not Found:
```json
{
  "error": "Player with id 999 not found"
}
```

500 - Server Error:
```json
{
  "error": "Failed to fetch player data"
}
```

## Caching

The API implements Redis caching with the following features:
- Cache duration: 5 minutes
- Automatic cache invalidation
- Fallback to API when cache is unavailable
- Error handling for cache misses

## Security Features

- Helmet for security headers
- Rate limiting (500 requests per minute per IP)
- CORS enabled
- Request size limits (1MB)
- Input validation
- Error sanitization

## Running the Application

### Local Development

1. Start the Redis server:
```bash
redis-server
```

2. Start the application:
```bash
# Production mode
npm start
```

The server will start on http://localhost:3000 (or the port specified in your .env file)

### Docker Deployment

1. Build and start the containers:
```bash
docker-compose up --build
```

2. To run in detached mode:
```bash
docker-compose up -d
```

3. To stop the containers:
```bash
docker-compose down
```

4. To view logs:
```bash
docker-compose logs -f
```

## Running Tests

```bash
# Local testing
npm test

# Testing in Docker
docker-compose run app npm test
```

## Error Handling

The API includes comprehensive error handling for:
- Invalid player IDs
- Redis connection issues
- API failures
- Invalid data formats
- Rate limit exceeded
- Network timeouts
- Validation errors

## Author

Sonalika Singh

## Acknowledgments

- Express.js for the web framework
- Redis for caching
- Jest for testing
- Docker for containerization
