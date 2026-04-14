import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { sequelize } from "../db/index.js";
import crypto from "crypto";

const assignBulkAccess = asyncHandler(async (req, res) => {
    const { userIds, menuIds, permissions, companyId, applyToAll } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        throw new ApiError(400, "At least one user must be selected");
    }

    if (!menuIds || !Array.isArray(menuIds) || menuIds.length === 0) {
        throw new ApiError(400, "At least one menu must be selected");
    }

    const t = await sequelize.transaction();

    try {
        for (const userId of userIds) {
            // Fetch current rights for the user in this company
            const [accessRecord] = await sequelize.query(
                "SELECT [rights_json] FROM [Zram_UserCompanyAccess] WHERE [user_id] = :userId AND [company_id] = :companyId",
                { replacements: { userId, companyId }, type: sequelize.QueryTypes.SELECT, transaction: t }
            );

            let currentRights = [];
            if (accessRecord && accessRecord.rights_json) {
                try {
                    currentRights = typeof accessRecord.rights_json === 'string' 
                        ? JSON.parse(accessRecord.rights_json) 
                        : accessRecord.rights_json;
                } catch (e) {
                    currentRights = [];
                }
            }

            // Update rights with the new menu selections and permissions
            // Note: This is a simplified version. Usually, you'd store detailed per-menu permissions.
            // For now, we'll store the menu IDs and the global permissions applied.
            
            const newRightsSet = new Set(currentRights);
            menuIds.forEach(mId => newRightsSet.add(mId));
            
            const updatedRights = Array.from(newRightsSet);

            if (accessRecord) {
                await sequelize.query(
                    "UPDATE [Zram_UserCompanyAccess] SET [rights_json] = :rights WHERE [user_id] = :userId AND [company_id] = :companyId",
                    { 
                        replacements: { 
                            userId, 
                            companyId, 
                            rights: JSON.stringify(updatedRights) 
                        }, 
                        transaction: t 
                    }
                );
            } else {
                await sequelize.query(
                    "INSERT INTO [Zram_UserCompanyAccess] ([id], [user_id], [company_id], [rights_json], [is_active]) VALUES (:id, :userId, :companyId, :rights, 1)",
                    { 
                        replacements: { 
                            id: crypto.randomUUID(),
                            userId, 
                            companyId, 
                            rights: JSON.stringify(updatedRights) 
                        }, 
                        transaction: t 
                    }
                );
            }
            
            // Also update RoleRights table if needed, or handle specific granular permissions
            // ... logic for granular RoleRight mapping ...
        }

        await t.commit();
        return res.status(200).json(new ApiResponse(200, null, "Access assigned successfully to all selected employees"));
    } catch (error) {
        if (t) await t.rollback();
        throw new ApiError(500, error.message || "Failed to assign bulk access");
    }
});

export { assignBulkAccess };
