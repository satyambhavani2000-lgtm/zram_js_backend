import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from './routes/user.routes.js'
import inventoryRouter from "./routes/inventory.routes.js"
import productionRouter from "./routes/production.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import companyRouter from "./routes/company.routes.js"



//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/inventory", inventoryRouter)
app.use("/api/v1/production", productionRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/companies", companyRouter)



export { app }

// Global error handler
import { ApiError } from "./utils/ApiError.js"

app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
            data: null
        });
    }

    return res.status(500).json({
        success: false,
        message: "Something went wrong! Internal Server Error.",
        errors: [err.message],
        data: null
    });
});