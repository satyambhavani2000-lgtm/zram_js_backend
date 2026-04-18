import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/index.js";

class DesignFile extends Model {}

DesignFile.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    originalName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fileType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    uploadedBy: {
        type: DataTypes.UUID,
        allowNull: true
    },
    annotations: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '[]'
    }
}, {
    sequelize,
    modelName: 'DesignFile',
    tableName: 'Zram_DesignFiles01',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Force sync the table if it does not exist
DesignFile.sync({ alter: true }).then(() => {
    console.log("Zram_DesignFiles01 table synced!");
}).catch(err => {
    console.error("Error syncing DesignFile:", err);
});

export { DesignFile };
