const express =  require('express')
const mongoose = require('mongoose')
const app = express()
const port = 3000

app.get('/',(req,res)=>{
    res.send("Hello World")
})

mongoose.connect('mongodb+srv://aayukris:eO80ik1GRjbrSVkn@cluster0.jnzgs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(()=>console.log("Success")).catch((err)=>console.log(err))

app.listen(port,()=>{
    console.log(`listening on ${port}`)
})