// Mock modules before requiring the code under test
jest.mock("redis", () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn().mockResolvedValue(),
    on: jest.fn(),
    get: jest.fn(),
    setEx: jest.fn().mockResolvedValue(),
    quit: jest.fn().mockResolvedValue(),
  })),
}));

// Mock axios instead of node-fetch
jest.mock("axios", () => ({
  get: jest.fn(),
}));

// Mock logger
jest.mock("../src/utils/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

// Mock redis client utility
jest.mock("../src/utils/redisClient", () => ({
  get: jest.fn(),
  setEx: jest.fn(),
}));

// Suppress console.log output during tests
console.log = jest.fn();
console.error = jest.fn();

// Mock Express
jest.mock("express", () => {
  const router = {
    get: jest.fn(),
    post: jest.fn(),
    use: jest.fn(),
  };

  const expressMock = () => {
    const app = {
      get: jest.fn().mockReturnThis(),
      post: jest.fn().mockReturnThis(),
      use: jest.fn().mockReturnThis(),
      listen: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      Router: jest.fn(() => router),
    };

    return app;
  };

  expressMock.Router = jest.fn(() => router);
  expressMock.json = jest.fn(() => jest.fn());
  expressMock.urlencoded = jest.fn(() => jest.fn());
  expressMock.static = jest.fn(() => jest.fn());

  return expressMock;
});

// Import after all mocks are set up
const redis = require("redis");
const express = require("express");
const axios = require("axios");
const redisClient = require("../src/utils/redisClient");
const logger = require("../src/utils/logger");
const {
  getAllPlayers,
  getPlayerById,
} = require("../src/controllers/playersController");

// Mock data for players
const mockPlayers = {
  players: [
    {
      id: 52,
      firstname: "Novak",
      lastname: "Djokovic",
      shortname: "N.DJO",
      sex: "M",
      country: {
        picture:
          "https://i.eurosport.com/_iss_/geo/country/flag/medium/6944.png",
        code: "SRB",
      },
      picture:
        "https://i.eurosport.com/_iss_/person/pp_clubteam/large/565920.jpg",
      data: {
        rank: 2,
        points: 2542,
        weight: 80000,
        height: 188,
        age: 31,
        last: [1, 1, 1, 1, 1],
      },
    },
    {
      id: 95,
      firstname: "Venus",
      lastname: "Williams",
      shortname: "V.WIL",
      sex: "F",
      country: {
        picture:
          "https://i.eurosport.com/_iss_/person/pp_clubteam/large/136449.jpg",
        code: "USA",
      },
      picture:
        "https://i.eurosport.com/_iss_/person/pp_clubteam/large/136450.jpg",
      data: {
        rank: 52,
        points: 1105,
        weight: 74000,
        height: 185,
        age: 38,
        last: [0, 1, 0, 0, 1],
      },
    },
    {
      id: 65,
      firstname: "Stan",
      lastname: "Wawrinka",
      shortname: "S.WAW",
      sex: "M",
      country: {
        picture:
          "https://i.eurosport.com/_iss_/geo/country/flag/large/2213.png",
        code: "SUI",
      },
      picture:
        "https://i.eurosport.com/_iss_/person/pp_clubteam/large/325225.jpg",
      data: {
        rank: 21,
        points: 1784,
        weight: 81000,
        height: 183,
        age: 33,
        last: [1, 1, 1, 0, 1],
      },
    },
  ],
};

describe("Tennis Players API", () => {
  let router;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get the router instance
    router = express.Router();
    // Set up the routes
    router.get("/", getAllPlayers);
    router.get("/:id", getPlayerById);
  });

  describe("GET /players", () => {
    it("should fetch players from cache when available", async () => {
      const mockCachedData = {
        players: [
          { id: 1, name: "Roger Federer", country: "Switzerland" },
          { id: 2, name: "Rafael Nadal", country: "Spain" },
        ],
      };
      redisClient.get.mockResolvedValueOnce(JSON.stringify(mockCachedData));

      const req = {};
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await getAllPlayers(req, res);

      expect(redisClient.get).toHaveBeenCalledWith("players_cache");
      expect(axios.get).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith("Serving from Redis cache");
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 1, name: "Roger Federer" }),
        ])
      );
    });

    it("should fetch players from remote API when cache is empty", async () => {
      redisClient.get.mockResolvedValueOnce(null);
      axios.get.mockResolvedValueOnce({ data: mockPlayers });

      const req = {};
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await getAllPlayers(req, res);

      expect(redisClient.get).toHaveBeenCalledWith("players_cache");
      expect(axios.get).toHaveBeenCalledWith(process.env.DATA_URL);
      expect(logger.info).toHaveBeenCalledWith("Fetching from remote source");
      expect(redisClient.setEx).toHaveBeenCalledWith(
        "players_cache",
        300,
        expect.any(String)
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 52 }),
          expect.objectContaining({ id: 95 }),
          expect.objectContaining({ id: 65 }),
        ])
      );
    });

    it("should handle API errors gracefully", async () => {
      redisClient.get.mockResolvedValueOnce(null);
      axios.get.mockRejectedValueOnce(new Error("Network error"));

      const req = {};
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await getAllPlayers(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        "API error:",
        expect.any(Error)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch players data",
      });
    });
  });

  describe("GET /players/:id", () => {
    it("should return a specific player by ID", async () => {
      const mockCachedData = {
        players: [
          {
            id: 52,
            firstname: "Novak",
            lastname: "Djokovic",
            shortname: "N.DJO",
            sex: "M",
            country: {
              picture:
                "https://i.eurosport.com/_iss_/geo/country/flag/medium/6944.png",
              code: "SRB",
            },
            picture:
              "https://i.eurosport.com/_iss_/person/pp_clubteam/large/565920.jpg",
            data: {
              rank: 2,
              points: 2542,
              weight: 80000,
              height: 188,
              age: 31,
              last: [1, 1, 1, 1, 1],
            },
          },
          {
            id: 95,
            firstname: "Venus",
            lastname: "Williams",
            shortname: "V.WIL",
            sex: "F",
            country: {
              picture:
                "https://i.eurosport.com/_iss_/person/pp_clubteam/large/136449.jpg",
              code: "USA",
            },
            picture:
              "https://i.eurosport.com/_iss_/person/pp_clubteam/large/136450.jpg",
            data: {
              rank: 52,
              points: 1105,
              weight: 74000,
              height: 185,
              age: 38,
              last: [0, 1, 0, 0, 1],
            },
          },
        ],
      };
      redisClient.get.mockResolvedValueOnce(JSON.stringify(mockCachedData));

      const req = { params: { id: "52" } };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await getPlayerById(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 52,
          firstname: "Novak",
          picture:
            "https://i.eurosport.com/_iss_/person/pp_clubteam/large/565920.jpg",
          country: expect.objectContaining({
            code: "SRB",
            picture:
              "https://i.eurosport.com/_iss_/geo/country/flag/medium/6944.png",
          }),
        })
      );
    });

    it("should return 404 for non-existent player", async () => {
      const mockCachedData = {
        players: [
          {
            id: 52,
            firstname: "Novak",
            lastname: "Djokovic",
            shortname: "N.DJO",
            sex: "M",
            country: {
              picture:
                "https://i.eurosport.com/_iss_/geo/country/flag/medium/6944.png",
              code: "SRB",
            },
            picture:
              "https://i.eurosport.com/_iss_/person/pp_clubteam/large/565920.jpg",
            data: {
              rank: 2,
              points: 2542,
              weight: 80000,
              height: 188,
              age: 31,
              last: [1, 1, 1, 1, 1],
            },
          },
          {
            id: 95,
            firstname: "Venus",
            lastname: "Williams",
            shortname: "V.WIL",
            sex: "F",
            country: {
              picture:
                "https://i.eurosport.com/_iss_/person/pp_clubteam/large/136449.jpg",
              code: "USA",
            },
            picture:
              "https://i.eurosport.com/_iss_/person/pp_clubteam/large/136450.jpg",
            data: {
              rank: 52,
              points: 1105,
              weight: 74000,
              height: 185,
              age: 38,
              last: [0, 1, 0, 0, 1],
            },
          },
        ],
      };
      redisClient.get.mockResolvedValueOnce(JSON.stringify(mockCachedData));

      const req = { params: { id: "999" } };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await getPlayerById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Player with id 999 not found",
      });
    });

    it("should handle invalid ID format", async () => {
      const mockCachedData = {
        players: [
          {
            id: 52,
            firstname: "Novak",
            lastname: "Djokovic",
            shortname: "N.DJO",
            sex: "M",
            country: {
              picture:
                "https://i.eurosport.com/_iss_/geo/country/flag/medium/6944.png",
              code: "SRB",
            },
            picture:
              "https://i.eurosport.com/_iss_/person/pp_clubteam/large/565920.jpg",
            data: {
              rank: 2,
              points: 2542,
              weight: 80000,
              height: 188,
              age: 31,
              last: [1, 1, 1, 1, 1],
            },
          },
          {
            id: 95,
            firstname: "Venus",
            lastname: "Williams",
            shortname: "V.WIL",
            sex: "F",
            country: {
              picture:
                "https://i.eurosport.com/_iss_/person/pp_clubteam/large/136449.jpg",
              code: "USA",
            },
            picture:
              "https://i.eurosport.com/_iss_/person/pp_clubteam/large/136450.jpg",
            data: {
              rank: 52,
              points: 1105,
              weight: 74000,
              height: 185,
              age: 38,
              last: [0, 1, 0, 0, 1],
            },
          },
        ],
      };
      redisClient.get.mockResolvedValueOnce(JSON.stringify(mockCachedData));

      const req = { params: { id: "invalid" } };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await getPlayerById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Player with id NaN not found",
      });
    });

    it("should handle Redis errors gracefully", async () => {
      redisClient.get.mockRejectedValueOnce(
        new Error("Redis connection error")
      );
      axios.get.mockRejectedValueOnce(new Error("API error"));

      const req = { params: { id: "1" } };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await getPlayerById(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        "Redis error, falling back to API:",
        expect.any(Error)
      );
      expect(logger.error).toHaveBeenCalledWith(
        "API error:",
        expect.any(Error)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch player data",
      });
    });
  });
});
