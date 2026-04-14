import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/index.js";

class Role extends Model {}

Role.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    roleName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'roleName'
    },
    companyId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'companyId',
        references: {
            model: 'Zram_Companies',
            key: 'id'
        }
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'isActive'
    }
}, {
    sequelize,
    modelName: 'Role',
    tableName: 'Zram_Roles',
    freezeTableName: true,
    timestamps: false,
    underscored: false
});

export { Role };
