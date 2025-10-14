import express from "express"
import dotenv from "dotenv"
import route from "./routes/eqrev"

//
const app=express()
dotenv.config()
//
app.use(express.json())
app.use("/api",route)

const port:string|undefined=process.env.PORT;
// 
app.listen(port,()=>
{
    console.log(`Server running on the port ${port}`)
})
