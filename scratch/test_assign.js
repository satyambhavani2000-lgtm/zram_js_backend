import { sequelize } from '../src/db/index.js';

async function test() {
    try {
        console.log("Fetching one row from Zram_UserCompanyAccess to see column names...");
        const [row] = await sequelize.query("SELECT TOP 1 * FROM Zram_UserCompanyAccess");
        if (row && row.length > 0) {
            console.log("COLUMNS FOUND:", Object.keys(row[0]));
            console.log("SAMPLE DATA:", row[0]);
        } else {
            console.log("No data found in Zram_UserCompanyAccess table.");
        }
    } catch (error) {
        console.error("FAIL to fetch columns:");
        console.error(error);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

test();
