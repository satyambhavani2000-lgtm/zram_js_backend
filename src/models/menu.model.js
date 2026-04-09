import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/index.js";

class Menu extends Model {}

Menu.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    label: {
        type: DataTypes.STRING,
        allowNull: false
    },
    path: {
        type: DataTypes.STRING,
        allowNull: true
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Stores MUI icon name e.g. DashboardIcon'
    },
    requiredRight: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Matches rights array in UserCompanyAccess'
    },
    parentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Menus',
            key: 'id'
        }
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
    modelName: 'Menu'
});

export { Menu };
