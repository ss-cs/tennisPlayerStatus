const express = require("express");
require("dotenv").config();
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const playersRouter = require("./src/routes/players");

const app = express();

const port = process.env.PORT || 3000;

// Adds helmet middleware
app.use(helmet());

//Body Parser Configuration
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// Using CORS
app.use(cors());

const allowlist = ["127.0.0.1"]; // Example IPs you want to allow

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 500, // limit each IP to 100 requests per windowMs
  skip: (request, response) => allowlist.includes(request.ip),
});

//  apply to all requests
app.use(limiter);

//call routes
app.use("/players", playersRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
