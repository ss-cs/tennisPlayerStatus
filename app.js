const express = require("express");
const applyMiddleware = require("./src/middlewares");
const playersRouter = require("./src/routes/players");

const app = express();

// Apply all middleware
applyMiddleware(app);

// Mount routes
app.use("/players", playersRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
