import { Router } from 'express';
import { getUserMenu, seedMenus } from "../controllers/menu.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/user-menu").get(verifyJWT, getUserMenu);
router.route("/seed").post(seedMenus);

export default router;
