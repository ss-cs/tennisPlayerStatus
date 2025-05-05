const axios = require("axios");
const redisClient = require("../utils/redisClient");
const logger = require("../utils/logger");

const REDIS_KEY = "players_cache";
const CACHE_TTL_SECONDS = 5 * 60;
const DATA_URL = process.env.DATA_URL;

async function getPlayersData() {
  try {
    const cached = await redisClient.get(REDIS_KEY);
    if (cached) {
      logger.info("Serving from Redis cache");
      return JSON.parse(cached);
    }
  } catch (err) {
    logger.error("Redis error, falling back to API:", err);
  }

  try {
    logger.info("Fetching from remote source");
    const response = await axios.get(DATA_URL);
    const data = response.data;

    if (!data.players) throw new Error("Invalid data format from remote");

    try {
      await redisClient.setEx(
        REDIS_KEY,
        CACHE_TTL_SECONDS,
        JSON.stringify(data)
      );
    } catch (cacheErr) {
      logger.error("Failed to cache in Redis:", cacheErr);
    }

    return data;
  } catch (apiErr) {
    logger.error("API error:", apiErr);
    throw apiErr;
  }
}

async function getAllPlayers(req, res) {
  try {
    const data = await getPlayersData();
    const sorted = data.players.sort((a, b) => a.id - b.id);
    res.json(sorted);
  } catch {
    res.status(500).json({ error: "Failed to fetch players data" });
  }
}

async function getPlayerById(req, res) {
  try {
    const data = await getPlayersData();
    const id = parseInt(req.params.id, 10);
    const player = data.players.find((p) => p.id === id);

    if (!player) {
      return res.status(404).json({ error: `Player with id ${id} not found` });
    }

    res.json(player);
  } catch {
    res.status(500).json({ error: "Failed to fetch player data" });
  }
}

module.exports = {
  getAllPlayers,
  getPlayerById,
};
