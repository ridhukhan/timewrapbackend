import express from "express";
import { Order } from "../model/ordermodel.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { adminMiddleware } from "../middleware/adminmiddleware.js";

const router = express.Router();

router.get("/orders", authMiddleware, adminMiddleware, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});
router.patch("/orders/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const { status } = req.body
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
  res.json(order)
})

export default router;