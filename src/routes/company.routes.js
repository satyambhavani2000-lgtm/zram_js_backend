import { Router } from 'express';
import { getAllCompanies } from "../controllers/company.controller.js";

const router = Router();

router.route("/list").get(getAllCompanies);

export default router;
