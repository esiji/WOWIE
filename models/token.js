const mongoose = require("mongoose");


const TokenSchema = mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    helper: {
        type: String,
        required: true
    }
})

const blizzardAPI = mongoose.model('blizzardApi', TokenSchema)

module.exports =  blizzardAPI