import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { UserCompany } from "../models/userCompany.model.js";
import { sequelize } from "../db/index.js";
import bcrypt from "bcrypt";


const generateAccessAndRefereshTokens = async (userId, companyId, rights) => {
    try {
        const user = await User.findByPk(userId);
        const accessToken = user.generateAccessToken(companyId, rights);
        const refreshToken = user.generateRefreshToken();

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};


const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, role } = req.body;

    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        where: {
            [Op.or]: [{ username }, { email }]
        }
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
        username: username.toLowerCase(),
        role: role || 'WORKER'
    });

    const createdUser = await User.findByPk(user.id, {
        attributes: { exclude: ['password', 'refreshToken'] }
    });

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    try {
        const { username, password, companyId } = req.body;
        const cleanUsername = username?.trim().toLowerCase() || "";

        console.log(`--- LOGIN ATTEMPT: [${cleanUsername}] | COMPANY: ${companyId} ---`);

        // 🟢 DEBUG STEP 1: TEST RAW CONNECTION
        const [userSearch] = await sequelize.query(
            "SELECT id, username, password_hash, full_name, global_role FROM Zram_Users01 WHERE LOWER(TRIM(username)) = :username",
            { replacements: { username: cleanUsername }, type: sequelize.QueryTypes.SELECT }
        );

        if (!userSearch) {
            console.log(`User [${cleanUsername}] not found in Zram_Users01`);
            return res.status(404).json(new ApiResponse(404, null, "User does not exist"));
        }

        console.log(`User [${userSearch.username}] found. Checking password...`);

        // 🟢 DEBUG STEP 2: PASSWORD CHECK (Supports both Plain Text and Bcrypt for testing)
        let isPasswordValid = false;
        if (password === userSearch.password_hash) {
            isPasswordValid = true; 
            console.log("Plain-text password match!");
        } else {
            try {
                isPasswordValid = await bcrypt.compare(password, userSearch.password_hash);
                if (isPasswordValid) console.log("Bcrypt password match!");
            } catch (e) {
                console.log("Bcrypt check failed (likely not a hash)");
            }
        }

        if (!isPasswordValid) {
            console.log("Password mismatch");
            return res.status(401).json(new ApiResponse(401, null, "Invalid credentials"));
        }


        // 🟢 DEBUG STEP 3: COMPANY CHECK
        const [authSearch] = await sequelize.query(
            "SELECT * FROM Zram_UserCompanyAccess WHERE user_id = :userId AND company_id = :companyId",
            { replacements: { userId: userSearch.id, companyId }, type: sequelize.QueryTypes.SELECT }
        );

        if (!authSearch) {
            console.log("No company authorization found in Zram_UserCompanyAccess");
            return res.status(403).json(new ApiResponse(403, null, "Not authorized for this company"));
        }

        console.log("Login Success! Generating token...");

        let userRights = authSearch.rights;
        if (typeof userRights === 'string' && userRights.trim() !== "") {
            try { 
                userRights = JSON.parse(userRights); 
            } catch (e) { 
                // Fallback: If not valid JSON, try to split by commas (e.g. "INV_VIEW, CUST_VIEW")
                userRights = userRights.split(',').map(r => r.trim()); 
                console.log("Parsed rights using comma-split fallback:", userRights);
            }
        } else if (!userRights) {
            userRights = [];
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(userSearch.id, companyId, userRights);

        const options = { httpOnly: true, secure: true };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, {
                user: { id: userSearch.id, username: userSearch.username, fullName: userSearch.full_name },
                accessToken,
                refreshToken,
                rights: userRights
            }, "Login successful"));

    } catch (error) {
        console.error("!!! LOGIN CRASH !!!");
        console.error(error);
        res.status(500).json(new ApiResponse(500, null, error.message || "Internal Login Error"));
    }
});

const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id);
    user.refreshToken = null;
    await user.save();

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findByPk(decodedToken?.id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefereshTokens(user.id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user?.id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName } = req.body;

    if (!fullName) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByPk(req.user?.id);
    user.fullName = fullName;
    await user.save();

    const updatedUser = await User.findByPk(user.id, {
        attributes: { exclude: ['password'] }
    });

    return res.status(200).json(new ApiResponse(200, updatedUser, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    const user = await User.findByPk(req.user?.id);
    user.avatar = avatar.url;
    await user.save();

    const updatedUser = await User.findByPk(user.id, {
        attributes: { exclude: ['password'] }
    });

    return res.status(200).json(new ApiResponse(200, updatedUser, "Avatar image updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading cover image");
    }

    const user = await User.findByPk(req.user?.id);
    user.coverImage = coverImage.url;
    await user.save();

    const updatedUser = await User.findByPk(user.id, {
        attributes: { exclude: ['password'] }
    });

    return res.status(200).json(new ApiResponse(200, updatedUser, "Cover image updated successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
};