import { Router } from 'express';
import { getUserMenu } from "../controllers/menu.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/user-menu").get(verifyJWT, getUserMenu);


export default router;
