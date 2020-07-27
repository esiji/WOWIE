const express = require('express');
require('dotenv/config')
const Character = require('../models/Character');
const fetch = require('node-fetch')
const Token = require('../models/token')
const path = require('path')


//variables
const router = express.Router()
const healers = ['Mistweaver', 'Restoration', 'Holy', 'Discipline']
const tanks = ['Protection', 'Brewmaster', 'Guadrian', 'Vengeance', 'Blood']

//Helper functions
const isWowArmoryValid = (link, name, server, region) =>{
    const linkArray = link.split('/')
    return [name, server, region].every(value => linkArray.includes(value))
}

const changeServerName = server => {
    return server.toLowerCase().split(' ').join('-')
}

const checkIfAccessTokenIsValid = async()  => {
    const token = await Token.find()
    let isValid = await fetch(`https://eu.battle.net/oauth/check_token?:region=eu&token=${token[0].token}`)
    isValid = await isValid.json()
    if(isValid.authorities[0] === "IS_AUTHENTICATED_FULLY"){
        return true
    }else {
        return false
    }
}

const checkRole = spec => {
    if(healers.includes(spec)){
        return 'Healer'
    }else if(tanks.includes(spec)){
        return 'Tank'
    }else {
        return 'Damage'
    }
}


//Routes
router.get('/page-:page', async (req, res) => {
    try{
        const characters = await Character.find()
        const charactersPerPage = 3;
        const page = Number(req.params.page)
        const lastPage = Math.ceil(characters.length / charactersPerPage)
        const pagedCharacters = characters.slice((page - 1) * charactersPerPage, charactersPerPage * page)
        res.render(path.join(process.cwd(), '/views/characters.pug'), {characters: pagedCharacters, page: page, lastPage: lastPage})
    }catch(err){
        res.render(path.join(process.cwd(), '/views/characters.pug'))
    }
})


router.get('/new', async (req, res) => {
    res.sendFile(path.join(process.cwd(), '/public/characterNew.html'))
})

router.post('/new/add', async (req, res) => {
    const name = req.body.name.toLowerCase()
    const region = req.body.region
    const server = changeServerName(req.body.server)
    const wowArmory = req.body.wowArmory.toLowerCase()

    const isDuplicate = await Character.exists({
        wowArmory: wowArmory
    })
    if(isDuplicate){
        res.render(path.join(process.cwd(), '/views/character-rejection.pug'), {error: 'This character is already in database!', token: false})
    }else {
        try {
            const isTokenValid = await checkIfAccessTokenIsValid()
            if(!isTokenValid) {
                res.render(path.join(process.cwd(), '/views/character-rejection.pug'), {error: 'Token expired! Get a new access token!', token: true})
            }else {
                let token = await Token.find()
                token = token[0].token
        
                let characterExists = await fetch(`https://eu.api.blizzard.com/profile/wow/character/${server}/${name}/status?namespace=profile-${region}&locale=en_US&access_token=${token}`)
                characterExists = await characterExists.json();
                characterExists = characterExists.is_valid;
        
                if(characterExists && isWowArmoryValid(wowArmory, name, server, region)){
                    let characterInfo = await fetch(`https://eu.api.blizzard.com/profile/wow/character/${server}/${name}?namespace=profile-${region}&locale=en_US&access_token=${token}`)
                    characterInfo = await characterInfo.json()
                    let characterMedia = await fetch(`https://eu.api.blizzard.com/profile/wow/character/${server}/${name}/character-media?namespace=profile-${region}&locale=en_US&access_token=${token}`)
                    characterMedia = await characterMedia.json()
                    const newCharacter = Character({
                        id: characterInfo.id,
                        name: characterInfo.name,
                        title: characterInfo.active_title ? characterInfo.active_title.name : 'titleless',
                        gender: characterInfo.gender.name,
                        faction: characterInfo.faction.name,
                        race: characterInfo.race.name,
                        class: characterInfo.character_class.name,
                        spec: characterInfo.active_spec.name,
                        role: checkRole(characterInfo.active_spec.name),
                        guild: characterInfo.guild ? characterInfo.guild.name : 'guildless',
                        level: characterInfo.level,
                        ilvl: characterInfo.equipped_item_level,
                        region: region === "eu" ? 'Europe' : 'America',
                        server: characterInfo.realm.name,
                        img_avatar: characterMedia.avatar_url,
                        img_half: characterMedia.bust_url,
                        img_body: characterMedia.render_url,
                        wowArmory: wowArmory
                    })
                    await newCharacter.save()
                    res.sendFile(path.join(process.cwd(), + '/public/characterAddConfirm.html'))
                }else {
                    if(!characterExists){
                        res.render(path.join(process.cwd(), '/views/character-rejection.pug'), {error: 'Character not found.', token: false})
                    }else if(!isWowArmoryValid(req.body.wowArmory.toLowerCase(), req.body.name.toLowerCase(), changeServerName(req.body.server), req.body.region)){
                        res.render(path.join(process.cwd(), '/views/character-rejection.pug'), {error: 'Wrong WoW armory link.', token: false})
                    }else {
                        res.render(path.join(process.cwd(), '/views/character-rejection.pug'), {error: 'Unknown Error', token: false})
                    }
                }
            }
        }catch(err) {
            res.render(path.join(process.cwd(), '/views/character-rejection.pug'), {error: 'Token expired! Get a new access token!', token: true})
        }
    }
})

router.put('/:id', async (req, res) => {
    try{
        const updatingCharacter  = await Character.findOne({
            id: req.params.id
        })
        const name = updatingCharacter.name.toLowerCase()
        const region = updatingCharacter.region === "Europe" ? 'eu' : 'na'
        const server = changeServerName(updatingCharacter.server)
        const isTokenValid = await checkIfAccessTokenIsValid()
        if(!isTokenValid) {
            res.render(path.join(process.cwd(), '/views/character-rejection.pug'), {error: 'Token expired! Get a new access token!', token: true})
        }else {
            let token = await Token.find()
            token = token[0].token
    
            let characterInfo = await fetch(`https://eu.api.blizzard.com/profile/wow/character/${server}/${name}?namespace=profile-${region}&locale=en_US&access_token=${token}`)
            characterInfo = await characterInfo.json()
            let characterMedia = await fetch(`https://eu.api.blizzard.com/profile/wow/character/${server}/${name}/character-media?namespace=profile-${region}&locale=en_US&access_token=${token}`)
            characterMedia = await characterMedia.json()
            await Character.updateOne({id: req.params.id}, {
                title: characterInfo.active_title ? characterInfo.active_title.name : 'titleless',
                gender: characterInfo.gender.name,
                faction: characterInfo.faction.name,
                race: characterInfo.race.name,
                spec: characterInfo.active_spec.name,
                role: checkRole(characterInfo.active_spec.name),
                guild: characterInfo.guild ? characterInfo.guild.name : 'guildless',
                level: characterInfo.level,
                ilvl: characterInfo.equipped_item_level,
                img_avatar: characterMedia.avatar_url,
                img_half: characterMedia.bust_url,
                img_body: characterMedia.render_url
            })
            res.redirect(303, `/characters/page-1`)
        }
    }catch(err){
        res.render(path.join(process.cwd(), '/views/character-rejection.pug'), {error: 'Token expired! Get a new access token!', token: true})
    }
})

router.delete('/:id', async (req, res) => {
    try{
        await Character.deleteOne({id: req.params.id})
        res.redirect(303 ,'/characters/1')
    }catch(err){
        res.json({message: err})
    }
})

router.get('/search', async(req, res) => {
    const option = req.query.option
    let query
    switch(option) {
        case('name'):
            query= {
                name: req.query.value
            }
            break
        case('server'):
            query= {
                server: req.query.value
            }
            break
        case('region'):
            query= {
                region: req.query.value
            }
            break
        case('role'):
            query= {
                role: req.query.value
            }
            break
        case('class'):
            query= {
                class: req.query.value
            }
            break
    }
    const foundCharacters = await Character.find(query)
    res.render(path.join(process.cwd(), '/views/characters-search.pug'), {characters: foundCharacters})
}) 


module.exports = router