//Imports
const express = require("express")
const mongoose = require("mongoose")
require('dotenv/config')
const charactersRouter = require('./Routes/characters')
const authRouter = require('./Routes/auth')
const passport = require('passport')
const path = require('path')

//Vars
const app = express()
const PORT = 3000

app.set("view engine", "pug")

//Middleware
app.use('/static', express.static(path.join(process.cwd(), '/public')))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(passport.initialize())

//Routers
app.use('/characters', charactersRouter)
app.use('/auth', authRouter)

//Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), '/public/index.html'))
})


// Connect to database
mongoose.connect(process.env.DB_URI,{useNewUrlParser: true, useUnifiedTopology: true})

passport.serializeUser(function(user, done) {
    done(null, user)
  });
  
passport.deserializeUser(function(user, done) {
  done(null, user)
});

// Listen to PORT
app.listen(PORT)