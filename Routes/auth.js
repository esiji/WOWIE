const express = require('express');
require('dotenv/config')
const passport = require('passport')
const BnetStrategy = require('passport-bnet').Strategy;
const Token = require('../models/token')



const router = express.Router()

passport.use(new BnetStrategy({
    clientID: process.env.BLIZZARD_CLIENT_ID,
    clientSecret: process.env.BLIZZARD_CLIENT_SECRET,
    scope: "wow.profile",
    callbackURL: "http://localhost:3000/auth/bnet/callback",
    region: 'eu'
}, async (accessToken, refreshToken, profile, done) => {
    await getNewAccessToken(accessToken)
    return done(null, profile)
}))


const getNewAccessToken = async (token)  => {
    await Token.remove({})
    const newToken = Token({
        token,
        helper: 'help'
    })
    const savedToken = await newToken.save()
    console.log(savedToken)
}



//Routes
router.get('/bnet', passport.authenticate('bnet'))

router.get('/bnet/callback', passport.authenticate('bnet', {failureRedirect: '/'}), (req, res) => {
    res.redirect('/')
})


module.exports = router