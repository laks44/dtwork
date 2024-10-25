const express =  require('express')
const mongoose = require('mongoose')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const port = 4000
const productRoutes = require('./routes/productRouter')

app.use(cors())
app.get('/',(req,res)=>{
    res.send("Hello World")
})

app.use(bodyParser.json())

//routes
app.use('/api/products', productRoutes)

mongoose.connect('mongodb+srv://aayukris:eO80ik1GRjbrSVkn@cluster0.jnzgs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(()=>console.log("Success")).catch((err)=>console.log(err))

app.listen(port,()=>{
    console.log(`listening on ${port}`)
})