import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Role } from "../models/role.model.js";
import { RoleRight } from "../models/roleRight.model.js";
import { Menu } from "../models/menu.model.js";
import { sequelize } from "../db/index.js";

const createRole = asyncHandler(async (req, res) => {
    const { roleName, description, permissions, companyId } = req.body;

    if (!roleName) {
        throw new ApiError(400, "Role name is required");
    }

    const t = await sequelize.transaction();

    try {
        console.log(`Attempting to create role: ${roleName} for company: ${companyId}`);
        const role = await Role.create({ 
            roleName, 
            description,
            companyId
        }, { transaction: t });

        if (permissions && Array.isArray(permissions)) {
            const rightsData = permissions.map(p => ({
                roleId: role.id,
                menuId: p.menuId,
                canView: p.view || false,
                canCreate: p.insert || false,
                canEdit: p.update || false,
                canDelete: p.delete || false
            }));
            await RoleRight.bulkCreate(rightsData, { transaction: t });
        }

        await t.commit();
        return res.status(201).json(new ApiResponse(201, role, "Role created successfully"));
    } catch (error) {
        if (t) await t.rollback();
        console.error("CRITICAL: Role Create Failed:", error.message);
        throw new ApiError(400, `DB Error: ${error.message}`);
    }
});

const getAllRoles = asyncHandler(async (req, res) => {
    try {
        const { companyId } = req.query;
        const where = { isActive: true };
        if (companyId) where.companyId = companyId;

        const roles = await Role.findAll({ where });
        return res.status(200).json(new ApiResponse(200, roles, "Roles fetched successfully"));
    } catch (error) {
        console.error("CRITICAL: Role Fetch Failed:", error.message);
        throw new ApiError(500, `DB Fetch Error: ${error.message}`);
    }
});

const deleteRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const role = await Role.findByPk(id);

    if (!role) {
        throw new ApiError(404, "Role not found");
    }

    role.isActive = false;
    await role.save();

    return res.status(200).json(new ApiResponse(200, null, "Role deleted successfully"));
});

export { 
    createRole, 
    getAllRoles, 
    deleteRole 
};
