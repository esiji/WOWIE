const mongoose = require("mongoose");


const CharacterSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    faction: {
        type: String,
        required: true
    },
    race: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    spec: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    guild: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    ilvl: {
        type: Number,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    server: {
        type: String,
        required: true
    },
    img_avatar: {
        type: String,
        required: true
    },
    img_half: {
        type: String,
        required: true
    },
    img_body: {
        type: String,
        required: true
    },
    wowArmory: {
        type: String,
        required: true
    }
})

const Character = mongoose.model('Characters', CharacterSchema)

module.exports =  Character