
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getERPStats = asyncHandler(async (req, res) => {
    // TODO: Get the ERP stats like total inventory, total production orders, materials, etc.
    return res.status(200).json(new ApiResponse(200, {}, "Stats fetched successfully"));
})

const getRecentActivity = asyncHandler(async (req, res) => {
    // TODO: Get all recent activities like stock added, order created etc.
    return res.status(200).json(new ApiResponse(200, [], "Activity fetched successfully"));
})

export {
    getERPStats,
    getRecentActivity
}