const apiRouter = require("express").Router();
const cors = require("cors");
const userController = require("./controllers/userController");
const postController = require("./controllers/postController");
const followController = require("./controllers/followController");

const { apiLogin, apiMustBeLoggedIn, apiGetPostsByUsername } = userController;
const { apiCreate, apiDelete } = postController;

apiRouter.use(cors());

apiRouter.post("/login", apiLogin);
apiRouter.post("/create-post", apiMustBeLoggedIn, apiCreate);
apiRouter.delete("/post/:id", apiMustBeLoggedIn, apiDelete);
apiRouter.get("/postsByUsername/:username", apiGetPostsByUsername);

module.exports = apiRouter;
