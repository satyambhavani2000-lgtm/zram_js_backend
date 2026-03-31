import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Inventory } from "../models/inventory.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addInventory = asyncHandler(async (req, res) => {
    const { materialName, materialType, purity, currentStock, unit } = req.body;

    if (!materialName || !materialType) {
        throw new ApiError(400, "Material name and type are required");
    }

    const item = await Inventory.create({
        materialName,
        materialType,
        purity,
        currentStock,
        unit
    });

    return res.status(201).json(new ApiResponse(201, item, "Material added to inventory"));
});

const getInventory = asyncHandler(async (req, res) => {
    const items = await Inventory.findAll();
    return res.status(200).json(new ApiResponse(200, items, "Inventory fetched successfully"));
});

const updateStock = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { quantity, action } = req.body; // action: 'ADD' or 'SUBTRACT'

    const item = await Inventory.findByPk(id);
    if (!item) {
        throw new ApiError(404, "Material not found");
    }

    if (action === 'ADD') {
        item.currentStock = parseFloat(item.currentStock) + parseFloat(quantity);
    } else if (action === 'SUBTRACT') {
        item.currentStock = parseFloat(item.currentStock) - parseFloat(quantity);
    }

    await item.save();
    return res.status(200).json(new ApiResponse(200, item, "Stock updated successfully"));
});

export {
    addInventory,
    getInventory,
    updateStock
};
