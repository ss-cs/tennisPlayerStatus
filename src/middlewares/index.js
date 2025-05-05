const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

module.exports = function applyMiddleware(app) {
  app.use(helmet());

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));

  app.use(cors());

  const allowlist = ["127.0.0.1"];

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 500,
    skip: (req) => allowlist.includes(req.ip),
  });

  app.use(limiter);
};
