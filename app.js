const express = require("express")
const app = express()
const indexrouter= require("./routes/index")
app.use("/",indexrouter);
app.listen(3000,()=>{
    console.log("server is listening.....")
})