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
        
        console.log(`Fetching menus for user: ${req.user.username}, role: ${req.user.role}`);

        // Using the new schema column names: menuName, route, parentMenuId, displayOrder
        const [menus] = await sequelize.query(`
            SELECT 
                m.id, 
                m.menuName, 
                m.route, 
                m.icon, 
                m.parentMenuId as parentId, 
                m.requiredRight as requiredRight,
                CASE WHEN EXISTS (SELECT 1 FROM Zram_Menus sub WHERE sub.parentMenuId = m.id) THEN 1 ELSE 0 END as hasSubmenu
            FROM Zram_Menus m
            WHERE m.isActive = 1
            ORDER BY m.displayOrder ASC
        `);

        // Filter menus based on user rights
        // 1. If user is a global 'ADMIN', show everything
        // 2. Otherwise, check if user has specific rights assigned
        const authorizedMenus = menus.filter(menu => {
            if (req.user.role === 'ADMIN') return true; 
            if (!menu.requiredRight) return true;
            return userRights.includes(menu.requiredRight);
        });

        return res.status(200).json(
            new ApiResponse(200, authorizedMenus, "Authorized menus fetched successfully")
        );
    } catch (error) {
        console.log("Error fetching user menu:", error.message);
        res.status(500).json(new ApiResponse(500, null, "Failed to load menus"));
    }
});

const getAllMenus = asyncHandler(async (req, res) => {
    try {
        const [menus] = await sequelize.query(`
            SELECT id, menuName, route, icon, parentMenuId as parentId, requiredRight, displayOrder, isActive
            FROM Zram_Menus
            ORDER BY displayOrder ASC
        `);
        return res.status(200).json(new ApiResponse(200, menus, "All menus fetched successfully"));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, "Failed to load menus"));
    }
});

const getAccessStats = asyncHandler(async (req, res) => {
    try {
        const [stats] = await sequelize.query(`
            SELECT 
                (SELECT COUNT(*) FROM Zram_Menus WHERE isActive = 1) as totalMenus,
                (SELECT COUNT(*) FROM Zram_Users01 WHERE is_active = 1) as totalEmployees,
                (SELECT COUNT(*) FROM Zram_UserCompanyAccess WHERE is_active = 1) as totalAssignments,
                (SELECT COUNT(*) FROM Zram_Menus WHERE parentMenuId IS NULL AND isActive = 1) as level1Menus,
                (SELECT COUNT(*) FROM Zram_Menus WHERE parentMenuId IN (SELECT id FROM Zram_Menus WHERE parentMenuId IS NULL) AND isActive = 1) as level2Menus,
                (SELECT COUNT(*) FROM Zram_Menus WHERE parentMenuId IN (SELECT id FROM Zram_Menus WHERE parentMenuId IN (SELECT id FROM Zram_Menus WHERE parentMenuId IS NULL)) AND isActive = 1) as level3Menus
        `);
        return res.status(200).json(new ApiResponse(200, stats[0], "Access stats fetched successfully"));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, "Failed to load access stats"));
    }
});

export { getUserMenu, getAllMenus, getAccessStats };
