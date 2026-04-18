import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { DesignFile } from "../models/designFile.model.js";
import path from "path";
import fs from "fs";

export const uploadDesignFile = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title) {
        throw new ApiError(400, "Title is required");
    }

    if (!req.file) {
        throw new ApiError(400, "Design file is required");
    }

    // Extract file details
    const file = req.file;
    const fileType = path.extname(file.originalname).toLowerCase();
    
    // Save to database
    const designFile = await DesignFile.create({
        title,
        description: description || "",
        originalName: file.originalname,
        filePath: file.filename, // we just store the filename, will serve from /designs
        fileType: fileType,
        uploadedBy: req.user?.id || null // if auth middleware is not applied strictly, allow null
    });

    return res.status(201).json(
        new ApiResponse(201, designFile, "Design file uploaded successfully")
    );
});

export const getDesignFiles = asyncHandler(async (req, res) => {
    const files = await DesignFile.findAll({
        order: [['created_at', 'DESC']]
    });

    return res.status(200).json(
        new ApiResponse(200, files, "Design files fetched successfully")
    );
});

export const downloadDesignFile = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const designFile = await DesignFile.findByPk(id);
    
    if (!designFile) {
        throw new ApiError(404, "Design file not found");
    }

    const filePath = path.resolve("./public/designs", designFile.filePath);

    if (!fs.existsSync(filePath)) {
        throw new ApiError(404, "File missing from server storage");
    }

    // Express helper to download a file
    res.download(filePath, designFile.originalName);
});

export const saveAnnotations = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { annotations } = req.body;

    const designFile = await DesignFile.findByPk(id);
    
    if (!designFile) {
        throw new ApiError(404, "Design file not found");
    }

    // Save annotations as stringified JSON
    designFile.annotations = JSON.stringify(annotations);
    await designFile.save();

    return res.status(200).json(
        new ApiResponse(200, designFile, "Annotations saved successfully")
    );
});

export const deleteDesignFile = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const designFile = await DesignFile.findByPk(id);
    
    if (!designFile) {
        throw new ApiError(404, "Design file not found");
    }

    const filePath = path.resolve("./public/designs", designFile.filePath);

    // Remove from filesystem if it exists
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch(e) {
            console.error("Failed to delete local file:", e);
        }
    }

    // Remove from SQL Database
    await designFile.destroy();

    return res.status(200).json(
        new ApiResponse(200, null, "Design file deleted successfully")
    );
});
