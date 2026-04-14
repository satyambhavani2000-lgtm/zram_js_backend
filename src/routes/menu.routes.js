import { Router } from "express";
import { getUserMenu, getAllMenus, getAccessStats } from "../controllers/menu.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/user-menu").get(verifyJWT, getUserMenu);
router.route("/all-menus").get(verifyJWT, getAllMenus);
router.route("/access-stats").get(verifyJWT, getAccessStats);

export default router;
