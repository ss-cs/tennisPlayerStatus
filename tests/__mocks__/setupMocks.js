// __mocks__/setupMocks.js

jest.mock("redis", () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn().mockResolvedValue(),
    on: jest.fn(),
    get: jest.fn(),
    setEx: jest.fn().mockResolvedValue(),
    quit: jest.fn().mockResolvedValue(),
  })),
}));

jest.mock("axios", () => ({
  get: jest.fn(),
}));

jest.mock("../../src/utils/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock("../../src/utils/redisClient", () => ({
  get: jest.fn(),
  setEx: jest.fn(),
}));

jest.mock("express", () => {
  const router = {
    get: jest.fn(),
    post: jest.fn(),
    use: jest.fn(),
  };
  const expressMock = () => ({
    get: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
    use: jest.fn().mockReturnThis(),
    listen: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    Router: jest.fn(() => router),
  });

  expressMock.Router = jest.fn(() => router);
  expressMock.json = jest.fn(() => jest.fn());
  expressMock.urlencoded = jest.fn(() => jest.fn());
  expressMock.static = jest.fn(() => jest.fn());

  return expressMock;
});

console.log = jest.fn();
console.error = jest.fn();
