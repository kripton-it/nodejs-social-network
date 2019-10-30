const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");
const postController = require("./controllers/postController");
const followController = require("./controllers/followController");

const {
  home,
  register,
  login,
  logout,
  mustBeLoggedIn,
  ifUserExists,
  profilePostsScreen
} = userController;
const {
  viewCreateScreen,
  create,
  viewSingle,
  viewEditScreen,
  edit,
  remove,
  search
} = postController;
const { addFollow } = followController;

// user related routes
router.get("/", home);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// profile related routes
router.get("/profile/:username", ifUserExists, profilePostsScreen);

// post related routes
router.get("/create-post", mustBeLoggedIn, viewCreateScreen);
router.post("/create-post", mustBeLoggedIn, create);
router.get("/post/:id", viewSingle);
router.get("/post/:id/edit", mustBeLoggedIn, viewEditScreen);
router.post("/post/:id/edit", mustBeLoggedIn, edit);
router.post("/post/:id/delete", mustBeLoggedIn, remove);
router.post("/search", search);

// follow related routes
router.post("/addFollow/:username", mustBeLoggedIn, addFollow);

module.exports = router;
