import { Router } from "express";
import { uploadDesignFile, getDesignFiles, downloadDesignFile, saveAnnotations, deleteDesignFile } from "../controllers/designFile.controller.js";
import { uploadDesign } from "../middlewares/designMulter.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Ensure 'req.user' exists by requiring authentication
router.use(verifyJWT);

// Route for uploading a file + metadata
// We expect a single file labeled "designFile" in the form-data
router.post("/upload", uploadDesign.single("designFile"), uploadDesignFile);

// Route for fetching all designs
router.route("/").get(getDesignFiles);

// Route for downloading specific file
router.route("/download/:id").get(downloadDesignFile);

// Route for saving annotations
router.route("/:id/annotations").patch(saveAnnotations);

// Route for deleting a design
router.route("/:id").delete(deleteDesignFile);

export default router;
