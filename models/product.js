const mongoose = require ('mongoose');
const productSchema = mongoose.schema({
    name :string,
prize:Number,
    catgory:String,
   stock: Boolean,
   description:String,
   image :String,
})

   module.exports = mongoose.model("user" , productSchema)
