import { asyncHandler } from "../utils/asyncHandler.js";
import { Menu } from "../models/menu.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Op } from "sequelize";

const getUserMenu = asyncHandler(async (req, res) => {
    // req.user is populated by verifyJWT middleware
    const rights = req.rights; 
    
    // Fetch all active menus that match the user's rights
    // If user has 'ADMIN' right, maybe show all? 
    // Or just filter by requiredRight.
    
    const query = {
        where: {
            isActive: true,
            [Op.or]: [
                { requiredRight: { [Op.in]: rights || [] } },
                { requiredRight: null } // Menus that everyone can see
            ]
        },
        order: [['order', 'ASC']]
    };

    const menus = await Menu.findAll(query);

    return res.status(200).json(
        new ApiResponse(200, menus, "Menu fetched successfully")
    );
});

const seedMenus = asyncHandler(async (req, res) => {
    // Temporary helper to seed some data if empty
    const count = await Menu.count();
    if (count === 0) {
        await Menu.bulkCreate([
            { label: 'Dashboard', path: '/dashboard', icon: 'DashboardIcon', order: 1 },
            { label: 'Inventory', path: '/inventory', icon: 'InventoryIcon', requiredRight: 'INVENTORY', order: 2 },
            { label: 'Production', path: '/production', icon: 'ProductionIcon', requiredRight: 'PRODUCTION', order: 3 },
            { label: 'Users', path: '/users', icon: 'PeopleIcon', requiredRight: 'ADMIN', order: 4 },
        ]);
    }
    return res.status(200).json(new ApiResponse(200, {}, "Seed checked"));
});

export { getUserMenu, seedMenus };
