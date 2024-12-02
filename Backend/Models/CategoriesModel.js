const mongoose = require('mongoose')
const connectDB = require('../Config/config')

connectDB()

const CategoriesSchema = new mongoose.Schema({
    Name:{
        type: String,
        required: true
    },
    Description:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        required: true
    }
}, {collection : 'Categories'} )

const Categories = mongoose.model('Categories', CategoriesSchema)

module.exports = Categories