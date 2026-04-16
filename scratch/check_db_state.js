import { sequelize } from "./src/db/index.js";
import { User } from "./src/models/user.model.js";
import { UserCompany } from "./src/models/userCompany.model.js";
import dotenv from "dotenv";

dotenv.config();

async function checkDb() {
    try {
        console.log("--- DATABASE CHECK ---");
        
        // 1. List Users
        const users = await sequelize.query("SELECT id, username, full_name FROM Zram_Users01", { type: sequelize.QueryTypes.SELECT });
        printTable("USERS", users);

        // 2. List Companies
        const companies = await sequelize.query("SELECT id, company_name FROM Zram_Companies", { type: sequelize.QueryTypes.SELECT });
        printTable("COMPANIES", companies);

        // 3. List Access Records
        const access = await sequelize.query("SELECT id, user_id, company_id, is_active FROM Zram_UserCompanyAccess", { type: sequelize.QueryTypes.SELECT });
        printTable("USER COMPANY ACCESS", access);

    } catch (error) {
        console.error("DB check failed:", error);
    } finally {
        await sequelize.close();
    }
}

function printTable(title, data) {
    console.log(`\n[ ${title} ]`);
    if (data.length === 0) {
        console.log("Empty");
    } else {
        console.table(data);
    }
}

checkDb();
