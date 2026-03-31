import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/index.js";

class Inventory extends Model {}

Inventory.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    materialName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    materialType: {
        type: DataTypes.ENUM('GOLD', 'DIAMOND', 'STONE', 'PART', 'OTHER'),
        allowNull: false
    },
    purity: {
        type: DataTypes.STRING, // e.g., "22K", "18K", "VVS-1"
        allowNull: true
    },
    currentStock: {
        type: DataTypes.DECIMAL(18, 4), // High precision for gold weight
        defaultValue: 0
    },
    unit: {
        type: DataTypes.ENUM('GRAM', 'CARAT', 'PIECE'),
        defaultValue: 'GRAM'
    },
    reorderLevel: {
        type: DataTypes.DECIMAL(18, 4),
        defaultValue: 0
    }
}, {
    sequelize,
    modelName: 'Inventory'
});

export { Inventory };
