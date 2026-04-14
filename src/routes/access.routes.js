import { Router } from 'express';
import { assignBulkAccess } from "../controllers/access.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/assign-bulk").post(verifyJWT, assignBulkAccess);

export default router;
