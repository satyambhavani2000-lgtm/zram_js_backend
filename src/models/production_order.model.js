import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/index.js";

class ProductionOrder extends Model {}

ProductionOrder.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    orderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    designCode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    customerName: {
        type: DataTypes.STRING
    },
    currentStage: {
        type: DataTypes.ENUM('CASTING', 'FILING', 'POLISHING', 'SETTING', 'FINISHING', 'HALLMARKING', 'COMPLETED'),
        defaultValue: 'CASTING'
    },
    targetDate: {
        type: DataTypes.DATE
    },
    issuedWeight: {
        type: DataTypes.DECIMAL(18, 4), // Weight of gold issued to worker
        allowNull: false
    },
    lostWeight: {
        type: DataTypes.DECIMAL(18, 4), // Calculated loss during production
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('OPEN', 'IN_PROGRESS', 'ON_HOLD', 'DELIVERED', 'CANCELLED'),
        defaultValue: 'OPEN'
    },
    materialId: {
        type: DataTypes.UUID,
        allowNull: false
    }

}, {
    sequelize,
    modelName: 'ProductionOrder'
});

export { ProductionOrder };
