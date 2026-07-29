const express = require('express');
const validateAuthToken = require('../middlewares/verifyToken.middleware');
const { getUserUrlsController, deleteUserUrlController, logoutController } = require('../controllers/user.controller');
const paginatedUrls = require('../middlewares/urlPaginator.middleware');
const userRouter = express.Router();

userRouter.get("/urls", validateAuthToken, paginatedUrls, getUserUrlsController);
userRouter.delete("/urls/:id", validateAuthToken, deleteUserUrlController);

//logout
userRouter.post("/logout", logoutController);


module.exports = userRouter;