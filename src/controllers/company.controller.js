import { asyncHandler } from "../utils/asyncHandler.js";
import { Company } from "../models/company.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllCompanies = asyncHandler(async (req, res) => {
    const companies = await Company.findAll({
        where: { isActive: true },
        attributes: ['id', 'companyName', 'companyCode']
    });

    return res.status(200).json(
        new ApiResponse(200, companies, "Companies fetched successfully")
    );
});

export { getAllCompanies };
