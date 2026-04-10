import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

class User extends Model {
    async isPasswordCorrect(password) {
        return await bcrypt.compare(password, this.password);
    }

    generateAccessToken(companyId, rights) {
        return jwt.sign(
            {
                id: this.id,
                username: this.username,
                fullName: this.fullName,
                role: this.role,
                companyId,
                rights
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        );
    }


    generateRefreshToken() {
        return jwt.sign(
            {
                id: this.id
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
        );
    }
}

User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        lowercase: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'full_name'
    },
    avatar: {
        type: DataTypes.STRING,
        field: 'avatar_url'
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'password_hash'
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'WORKER',
        field: 'global_role'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    sequelize,
    modelName: 'User',
    tableName: 'Zram_Users01',
    freezeTableName: true,
    timestamps: false,
    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});





export { User };