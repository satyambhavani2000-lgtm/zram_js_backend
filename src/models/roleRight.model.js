import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/index.js";

class RoleRight extends Model {}

RoleRight.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    roleId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'roleId',
        references: {
            model: 'Zram_Roles',
            key: 'id'
        }
    },
    menuId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'menuId',
        references: {
            model: 'Zram_Menus',
            key: 'id'
        }
    },
    canView: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    canCreate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    canEdit: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    canUpdate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    canDelete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    canExport: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    canViewImage: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'RoleRight',
    tableName: 'Zram_RoleRights',
    freezeTableName: true,
    timestamps: false,
    underscored: false
});

export { RoleRight };
