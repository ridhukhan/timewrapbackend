import express from "express"
import { ordercotroller } from "../controller/ordercontroller.js"
const router=express.Router()
router.post("/order",ordercotroller)

export default router;