import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/index.js";

class UserCompany extends Model {}

UserCompany.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    companyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Companies',
            key: 'id'
        }
    },
    rights: {
        type: DataTypes.JSON, // Stores an array of menu rights e.g., ["DASHBOARD", "INVENTORY", "PRODUCTION"]
        defaultValue: []
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'USER'
    }
}, {
    sequelize,
    modelName: 'UserCompany'
});

export { UserCompany };
