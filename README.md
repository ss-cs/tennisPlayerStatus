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
NODE_ENV = development // for production change this.
PORT=3000
DATA_URL=<your-data-source-url>
REDIS_HOST=redis  //For docker use redis value and for running on local use localhost.
REDIS_PORT=6379
```

## Project Structure

```
tennisPlayerStatus/
├── src/
│   ├── controllers/
│   │   └── playersController.js
│   ├── routes/
│   │   └── players.js
│   ├── middlewares/
│   │   └── errors.js
│   └── utils/
│       ├── redisClient.js
│       └── logger.js
├── tests/
│   └── players.test.js
├── app.js
├── package.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## API Endpoints

### GET /players
Returns a list of all tennis players.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Roger Federer",
    "country": "Switzerland"
  },
  {
    "id": 2,
    "name": "Rafael Nadal",
    "country": "Spain"
  }
]
```

### GET /players/:id
Returns a specific tennis player by ID.

**Response:**
```json
{
  "id": 1,
  "name": "Roger Federer",
  "country": "Switzerland"
}
```

## Caching

The API implements Redis caching with the following features:
- Cache duration: 5 minutes
- Automatic cache invalidation
- Fallback to API when cache is unavailable

## Security Features

- Helmet for security headers
- Rate limiting (500 requests per minute per IP)
- CORS enabled
- Request size limits (1MB)

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

### Docker Configuration

To run this app, you need to have the following installed:

- **Node.js** (v20 or higher)
- **Redis** (for local development)
- **Docker** (for containerized deployment)

---
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

## Author

Sonalika Singh

## Acknowledgments

- Express.js for the web framework
- Redis for caching
- Jest for testing
- Docker for containerization
