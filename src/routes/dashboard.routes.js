import { Router } from 'express';
import {
    getERPStats,
    getRecentActivity,
} from "../controllers/dashboard.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/stats").get(getERPStats);
router.route("/activity").get(getRecentActivity);


export default router