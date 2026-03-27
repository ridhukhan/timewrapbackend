import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
customername:{
    type:String,
    required:true
},
phone:{
    type:String,
    required:true
},

adress:{
    type:String,
    required:true
},
price:{
    type:String,
    required:true
},
quantity:{
    type:String,
    required:true
},
watchname:{
    type:String,
    required:true
},
status: {
  type: String,
  enum: ["pending", "delivered", "return"],
  default: "pending"
}
},{timestamps:true})

export const Order=mongoose.model("order",orderSchema)