const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");
const postController = require("./controllers/postController");

const { home, register, login, logout, mustBeLoggedIn } = userController;
const { viewCreateScreen, create, viewSingle } = postController;

// user related routes
router.get("/", home);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// post related routes
router.get("/create-post", mustBeLoggedIn, viewCreateScreen);
router.post("/create-post", create);
// router.post("/create-post", mustBeLoggedIn, create); ???
router.get("/post/:id", viewSingle)

module.exports = router;
