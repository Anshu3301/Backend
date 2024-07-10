//link:https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj

import express from 'express'

const app = express();

const port = 4000;

app.get('/',(req,res)=>{
    res.send(`<h1>Hi</h1>`)
})

app.listen(port,()=>{
    console.log(`Live on Localhost:${port}`);
})