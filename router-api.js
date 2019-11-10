const apiRouter = require("express").Router();
const userController = require("./controllers/userController");
const postController = require("./controllers/postController");
const followController = require("./controllers/followController");

const { apiLogin } = userController;

apiRouter.post("/login", apiLogin);

module.exports = apiRouter;
