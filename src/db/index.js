import { Sequelize } from "sequelize";
import { DB_NAME } from "../constants.js";

const sequelize = new Sequelize(
    process.env.DB_DATABASE, 
    process.env.DB_USERNAME, 
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_SERVER,
        dialect: 'mssql',
        dialectOptions: {
            options: {
                encrypt: false,
                trustServerCertificate: true
            }

        },
        logging: false
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log(`\n SQL Server connected !! DB HOST: ${process.env.DB_SERVER} | DATABASE: ${process.env.DB_DATABASE}`);

        
        // Controlled synchronization
        if (process.env.DB_SYNC === 'true') {
            console.log("Synchronizing models...");
            await sequelize.sync({ alter: true });
            console.log("All models were synchronized successfully.");
        }

    } catch (error) {
        console.log("SQL SERVER connection FAILED ", error);
        process.exit(1)
    }
}

export { sequelize };
export default connectDB;