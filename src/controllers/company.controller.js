import { asyncHandler } from "../utils/asyncHandler.js";
import { Company } from "../models/company.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * @desc Get all active companies for login dropdown
 * @route GET /api/v1/companies/list
 */
const getAllCompanies = asyncHandler(async (req, res) => {
    try {
        const companies = await Company.findAll({
            where: { isActive: true },
            attributes: ['id', 'companyName', 'companyCode', 'logoUrl']
        });

        return res.status(200).json(
            new ApiResponse(200, companies, "Companies fetched successfully")
        );
    } catch (error) {
        console.error("Error in getAllCompanies:", error.message);
        res.status(500).json(new ApiResponse(500, null, "Internal Server Error while fetching companies"));
    }
});

export { getAllCompanies };
