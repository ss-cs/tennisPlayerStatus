const express = require("express");
const router = express.Router();
const { errorHandler } = require("../middlewares/errors");
const {
  getAllPlayers,
  getPlayerById,
} = require("../controllers/playersController");

router.get("/", getAllPlayers);
router.get("/:id", getPlayerById);

//error handling
router.use(errorHandler);

module.exports = router;
