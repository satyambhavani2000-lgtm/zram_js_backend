import { Router } from "express";
import { createRole, getAllRoles, deleteRole } from "../controllers/role.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Secure all role routes

router.route("/list").get(getAllRoles);
router.route("/create").post(createRole);
router.route("/delete/:id").delete(deleteRole);

export default router;
