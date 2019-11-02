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
  profilePostsScreen,
  profileFollowersScreen,
  profileFollowingScreen,
  sharedProfileData
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
const { addFollow, removeFollow } = followController;

// user related routes
router.get("/", home);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// profile related routes
router.get("/profile/:username", ifUserExists, sharedProfileData, profilePostsScreen);
router.get(
  "/profile/:username/followers", ifUserExists, sharedProfileData, profileFollowersScreen
);
router.get(
  "/profile/:username/following", ifUserExists, sharedProfileData, profileFollowingScreen
);

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
router.post("/removeFollow/:username", mustBeLoggedIn, removeFollow);

module.exports = router;
