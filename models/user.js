const mongoose = require ('mongoose');
const addressSchema = mongoose.schema({
    state:string,
    zip:number,
    city:string,
    address:String
})
const userschema = mongoose.schema({
    name:String,
    email:String,
    password:String,
    phone: Number,
    addresses:[addressSchema],
},
    {timestamps:true}
)