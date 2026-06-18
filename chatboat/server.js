import express from 'express';
import cors from 'cors'
import { generateFunction } from './chatboat.js';

const app = express();
const port = 8888;

app.use(express.json())
app.use(cors())

app.get('/',(req,res)=>{
    res.send('Server is up 🚀')
})

app.post('/chat' ,async (req,res)=>{
    const {message , threadId} = req.body;

    if (!message || !threadId) {
        return res.status(400).json({message:"All Fields are required"})
    }

    // console.log('message' , message)
    const result = await generateFunction(message ,threadId)
    res.json({message:result})
})


app.listen(port,()=>{
    console.log(`Servar is running on port: ${port} ⚙️`)
})