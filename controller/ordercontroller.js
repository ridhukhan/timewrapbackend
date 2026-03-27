import { Order } from "../model/ordermodel.js"

export const ordercotroller= async(req,res)=>{
    const {customername,phone,adress,watchname,price,quantity}=req.body
    if(!customername || !phone || !adress){
        return res.status(400).json({
            message:"all field are required"
        })
    }

    const newOrder= new Order({
        customername,
        phone,
        adress,
        watchname,
        price,
        quantity
    })
    await newOrder.save()
    res.status(200).json({
        message:"order create successfully"
    })
}