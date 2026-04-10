import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sequelize } from "../db/index.js";

/**
 * @desc Get authorized menu list for the logged-in user
 * @route GET /api/v1/menu/user-menu
 */
const getUserMenu = asyncHandler(async (req, res) => {
    try {
        const userRights = req.user.rights || []; // Injected by auth middleware
        
        console.log(`Fetching menus for rights: ${JSON.stringify(userRights)}`);

        // We fetch whether the menu has children to show the dropdown arrow (hasSubmenu)
        const [menus] = await sequelize.query(`
            SELECT 
                m.id, 
                m.label, 
                m.path, 
                m.icon_name as icon, 
                m.parent_id as parentId, 
                m.required_right as requiredRight,
                CASE WHEN EXISTS (SELECT 1 FROM Zram_Menus sub WHERE sub.parent_id = m.id) THEN 1 ELSE 0 END as hasSubmenu
            FROM Zram_Menus m
            WHERE m.is_active = 1
            ORDER BY m.display_order ASC
        `);


        // Filter menus based on user rights
        // 1. If user is a global 'ADMIN', show everything
        // 2. Otherwise, check if menu is public (no requiredRight) or user has the specific right
        const authorizedMenus = menus.filter(menu => {
            if (req.user.role === 'ADMIN') return true; 
            if (!menu.requiredRight) return true;
            return userRights.includes(menu.requiredRight);
        });

        return res.status(200).json(
            new ApiResponse(200, authorizedMenus, "Authorized menus fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching user menu:", error.message);
        res.status(500).json(new ApiResponse(500, null, "Failed to load menus"));
    }
});

export { getUserMenu };
