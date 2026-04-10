import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/index.js";

class Menu extends Model {}

Menu.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    menuName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    parentMenuId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    route: {
        type: DataTypes.STRING,
        allowNull: true
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Menu',
    tableName: 'Zram_Menus',
    freezeTableName: true
});

export { Menu };
