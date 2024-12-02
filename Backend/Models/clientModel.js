const mongoose = require('mongoose')
const connectDB = require('../Config/config')

connectDB()

const ClientSchema = new mongoose.Schema({
    FirstName:{
        type: String,
        required: true
    },
    LastName:{
        type: String,
        required: true
    },
    Email:{
        type: String,
        required: true
    },
    Password:{
        type: String,
        required: true
    },
    PostalCode:{
        type: Number,
        required: true
    },
    State:{
        type: String,
        required: true
    },
    City:{
        type: String,
        required: true
    },
    Address:{
        type: String,
        required: true
    },
    Notes:{
        type: String,
        required: true
    },
    GSTIN:{
        type: String,
        required: true
    },
    Profile:{
        type: String,
        required: true
    }
}, { timestamps :true })

module.exports = mongoose.model('Client', ClientSchema);