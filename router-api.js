const apiRouter = require("express").Router();
const userController = require("./controllers/userController");
const postController = require("./controllers/postController");
const followController = require("./controllers/followController");

const { apiLogin, apiMustBeLoggedIn } = userController;
const { apiCreate, apiDelete } = postController;

apiRouter.post("/login", apiLogin);
apiRouter.post("/create-post", apiMustBeLoggedIn, apiCreate);
apiRouter.delete("/post/:id", apiMustBeLoggedIn, apiDelete);

module.exports = apiRouter;
