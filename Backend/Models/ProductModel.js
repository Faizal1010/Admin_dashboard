const mongoose = require('mongoose')
const connectDB = require('../Config/config')

connectDB()

const ProductsSchema = new mongoose.Schema({
    ProductTitle:{
        type: String,
        required: true
    },
    ProductDescription:{
        type: String,
        required: true
    },
    ProductCode:{
        type: String,
        required: true
    },
    Category:{
        type: String,
        required: true
    },
    Images:{
        type: Array,
        required: true
    }
}, { timestamps :true })

module.exports = ProductsSchema