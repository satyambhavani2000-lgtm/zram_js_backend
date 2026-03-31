import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addInventory, getInventory, updateStock } from "../controllers/inventory.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/add-item").post(addInventory);
router.route("/all").get(getInventory);
router.route("/update-stock/:id").patch(updateStock);

export default router;
