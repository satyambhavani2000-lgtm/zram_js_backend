import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/index.js";

class AuditLog extends Model {}

AuditLog.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Zram_Users01',
            key: 'id'
        }
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'Zram_AuditLogs',
    freezeTableName: true
});

export { AuditLog };
