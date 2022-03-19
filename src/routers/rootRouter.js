import express from "express";
import {getJoin, postJoin, getLogin, postLogin, logout} from "../controllers/userController"
import {home, search} from "../controllers/videoController"

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join").get(getJoin).post(postJoin);
rootRouter.get("/logout", logout)
rootRouter.route("/login").get(getLogin).post(postLogin);
rootRouter.get("/search", search);

export default rootRouter;