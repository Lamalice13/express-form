const { Router } = require("express");
const usersRouter = Router();
const usersController = require("../controllers/usersController");

usersRouter.get("/", usersController.usersListGet);

usersRouter
  .route("/create")
  .post(usersController.usersCreatePost)
  .get(usersController.usersCreateGet);

usersRouter.get("/search", usersController.userSearchGet);

usersRouter
  .route("/:id/update")
  .get(usersController.usersUpdateGet)
  .post(usersController.usersUpdatePost);

usersRouter.post("/:id/delete", usersController.usersDeletePost);

usersRouter.param("id", usersController.getUserId);

module.exports = usersRouter;
