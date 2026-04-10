import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/index.js";

class Company extends Model { }

Company.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'company_name'
    },
    companyCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'company_code'
    },
    logoUrl: {
        type: DataTypes.STRING,
        field: 'logo_url'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }

}, {
    sequelize,
    modelName: 'Company',
    tableName: 'Zram_Companies',
    freezeTableName: true,
    timestamps: false // Disabling this to prevent crashes if columns are missing
});




export { Company };
