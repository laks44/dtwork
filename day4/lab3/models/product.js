const mongoose = require('mongoose')
//schema = table structure = columns name of that table

const productSchema = new mongoose.Schema({
    p_name : {
        type: String,
        required : true
    },
    price : {
        type: Number,
        required: true
    },
    description : {
        type: String,
        default: "default description"
    }
})

const Product = mongoose.model('Product', productSchema)
//es 6 feature exports => so you can call this in any of the file and you can use that feature

module.exports = Product;