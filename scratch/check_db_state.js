import { sequelize } from "../db/index.js";
import dotenv from "dotenv";
import crypto from "crypto";

// Load backend .env for DB credentials
dotenv.config();

async function grantAdminAccess() {
    console.log("🚀 STARTING: DB ACCESS GRANT...");

    try {
        // 1. GET USER (satyam or Administrator)
        const [users] = await sequelize.query(
            "SELECT id, username FROM Zram_Users01 WHERE LOWER(username) IN ('satyam', 'administrator')"
        );
        
        if (users.length === 0) {
            console.log("❌ ERROR: No user found. Please register first or check username spellings.");
            return;
        }

        // 2. GET COMPANY (DIPL or first available)
        const [companies] = await sequelize.query("SELECT id, company_name FROM Zram_Companies");
        if (companies.length === 0) {
            console.log("❌ ERROR: No companies found in Zram_Companies.");
            return;
        }

        const targetCompany = companies[0]; // Just use the first one if multiple exist
        const rights = JSON.stringify(["ADMIN", "INVENTORY", "SALES", "DASHBOARD"]);

        console.log(`\nFound User IDs: ${users.map(u => u.username).join(', ')}`);
        console.log(`Targeting Company: ${targetCompany.company_name} (${targetCompany.id})\n`);

        for (const user of users) {
            console.log(`Updating access for [${user.username}]...`);

            // Check if mapping exists
            const [existing] = await sequelize.query(
                "SELECT id FROM Zram_UserCompanyAccess WHERE user_id = :userId AND company_id = :companyId",
                { replacements: { userId: user.id, companyId: targetCompany.id } }
            );

            if (existing.length > 0) {
                // UPDATE
                await sequelize.query(
                    "UPDATE Zram_UserCompanyAccess SET company_role = 'ADMIN', rights_json = :rights, is_active = 1 WHERE user_id = :userId AND company_id = :companyId",
                    { replacements: { userId: user.id, companyId: targetCompany.id, rights } }
                );
                console.log("✅ ACCESS UPDATED (to ADMIN)");
            } else {
                // INSERT
                await sequelize.query(
                    "INSERT INTO Zram_UserCompanyAccess (id, user_id, company_id, company_role, rights_json, is_active) VALUES (:id, :userId, :companyId, 'ADMIN', :rights, 1)",
                    { 
                        replacements: { 
                            id: crypto.randomUUID(),
                            userId: user.id, 
                            companyId: targetCompany.id, 
                            rights 
                        } 
                    }
                );
                console.log("✅ ACCESS CREATED (as ADMIN)");
            }
        }

        console.log("\n✨ ALL DONE! Refresh your browser to see the unlocked Dashboard.");

    } catch (error) {
        console.error("❌ CRITICAL ERROR:", error.message);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

grantAdminAccess();
