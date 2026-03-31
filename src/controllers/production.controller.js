import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ProductionOrder } from "../models/production_order.model.js";
import { Inventory } from "../models/inventory.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sequelize } from "../db/index.js";

const createOrder = asyncHandler(async (req, res) => {
    const { orderNumber, designCode, issuedWeight, materialId, customerName, targetDate } = req.body;

    if (!orderNumber || !issuedWeight || !materialId) {
        throw new ApiError(400, "Order number, issued weight and material ID are required");
    }

    const t = await sequelize.transaction();

    try {
        const material = await Inventory.findByPk(materialId);
        if (!material) throw new ApiError(404, "Material not found");

        if (parseFloat(material.currentStock) < parseFloat(issuedWeight)) {
            throw new ApiError(400, "Insufficient material in stock");
        }

        const order = await ProductionOrder.create({
            orderNumber,
            designCode,
            issuedWeight,
            customerName,
            targetDate
        }, { transaction: t });

        material.currentStock = parseFloat(material.currentStock) - parseFloat(issuedWeight);
        await material.save({ transaction: t });

        await t.commit();
        return res.status(201).json(new ApiResponse(201, order, "Production order created and gold issued"));
    } catch (error) {
        await t.rollback();
        throw error;
    }
});

const updateStage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { stage, lostWeight } = req.body;

    const order = await ProductionOrder.findByPk(id);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    order.currentStage = stage;
    if (lostWeight) {
        order.lostWeight = parseFloat(order.lostWeight) + parseFloat(lostWeight);
    }
    
    await order.save();
    return res.status(200).json(new ApiResponse(200, order, "Production stage updated"));
});

export {
    createOrder,
    updateStage
};
