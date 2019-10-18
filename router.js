const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");

const { home, register } = userController;

router.get("/", home);
router.post("/register", register);

module.exports = router;
