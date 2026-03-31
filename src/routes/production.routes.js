import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createOrder, updateStage } from "../controllers/production.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/create-order").post(createOrder);
router.route("/update-stage/:id").patch(updateStage);

export default router;
