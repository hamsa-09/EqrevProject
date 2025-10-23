import express from "express"
import dotenv from "dotenv"
import route from "./routes/eqrev"
import cors from "cors"


//express setup
const app=express()
dotenv.config()
// cors origin
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json())
app.use("/api",route)

const port:string|undefined=process.env.PORT;
//listening to port
app.listen(port,()=>
{
    console.log(`Server running on the port ${port}`)
})
