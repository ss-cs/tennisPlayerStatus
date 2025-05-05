# Node.js API with Redis Caching

This is a Node.js application that implements an API with Redis caching. The API fetches player data from a remote URL and caches it in Redis to improve performance. The cache is refreshed periodically, and Redis ensures fast access to frequently used data.

## Features

- **GET /players**: Fetches a list of players, either from the Redis cache or the remote API.
- **GET /players/:id**: Fetches a single player by ID, either from the Redis cache or the remote API.
- **Caching**: Data is cached in Redis to reduce external API calls. Cache expiry is set to 5 minutes.

---

## Prerequisites

To run this app, you need to have the following installed:

- **Node.js** (v20 or higher)
- **Redis** (for local development)
- **Docker** (for containerized deployment)

---

## Installation

### 1. Clone the repository:

```bash
git clone https://github.com/your-username/node-redis-caching-api.git
cd node-redis-caching-api
```
