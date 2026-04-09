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
        lowercase: true,
        validate: {
            notEmpty: true
        }
    },

    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    avatar: {
        type: DataTypes.STRING, // cloudinary url
        allowNull: false
    },
    coverImage: {
        type: DataTypes.STRING, // cloudinary url
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    refreshToken: {
        type: DataTypes.STRING
    },
    role: {
        type: DataTypes.ENUM('ADMIN', 'MANAGER', 'WORKER', 'SALES'),
        defaultValue: 'WORKER'
    }
}, {
    sequelize,
    modelName: 'User',
    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

export { User };