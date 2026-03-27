import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import userOrder from "./routes/orderroute.js"
import connectDB from "./database/database.js"
import authRoute from "./routes/authroute.js";
import adminRoute from "./routes/adminroute.js";
import cookieParser from "cookie-parser";
dotenv.config()
const app=express()
const port=3000
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(express.json())
app.use(cookieParser());
app.use("/user",userOrder)
app.use("/auth", authRoute);
app.use("/admin", adminRoute);

app.listen(port,()=>{
    connectDB()
    console.log(`your timewrap open in http://localhost:${port}`)
})