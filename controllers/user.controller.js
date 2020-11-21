const {User} = require('../database/models/user.model')
const {Person} = require('../database/models/person.model')
const {uploadUserPhoto,deleteImage,handValidationError} = require('../functions/functions')
const _ = require('lodash')
const {validationError} = require('../classes/validation.error')
const {compare} = require('bcryptjs')

const signUp = async (req,res,next) => {
    const email = req.body.email
    const password = req.body.password
    try{
        let users = await Person.find({email})
        if(! _.isEmpty(users)){
            const emailErr = new validationError()
            emailErr.field = 'email',
            emailErr.message = 'this email already used',
            emailErr.code = 'DUPLICATED'
            throw emailErr
        }
        const user = await User.create({email,password})
        res.status(201).json(user)
        next()
    }
    catch(e){
        if(e.errors){
            return res.status(422).json(handValidationError(e))
        }
        res.status(422).json(e)
    }
}

const login = async (req,res,next) =>{
    const email = req.body.email
    const password = req.body.password
    try{
        const users = await User.find({email:email})
        if(_.isEmpty(users)){
            const notFoundEmailErr = new validationError()
            notFoundEmailErr.field = 'email'
            notFoundEmailErr.message = 'this email doesn\'t exist'
            notFoundEmailErr.code = 'NOTFOUND'
            throw notFoundEmailErr
        }
        const user = users[0]
        await user.checkPassword(password)
        const token = await user.generateToken()
        res.json({user,token})
        next()
    }
    catch(e){
        res.status(401).json(e)
    }
}
const autoLogin = async (req,res,next) =>{
    const token = req.header('token')
    try{
        const user = await User.findByToken(token)
        if(!user){
            const userErr = new validationError()
            userErr.code = 'UNAUTHORIZED'
            userErr.field = 'token'
            userErr.message = 'this token is expired'
            throw userErr
        }
        res.json({user,token})
        next()
    }
    catch(e){
        res.status(401).json(e)
    }
}
const logOut = (req,res,next) =>{
    const user = req.user
    try{
        user.logOut()
        res.json({ 
            logged_out:true
        })
        next()
    }
    catch(e){
        res.status(500).json(e)
    }
}

const changePassword = async (req,res,next) =>{
    const oldPass = req.body.oldPassword
    const newPass = req.body.newPassword
    try{
        const same = await compare(oldPass,req.user.password)
        if(!same){
            const passErr = new validationError()
            passErr.code = 'INVALID'
            passErr.field = 'oldPassword'
            passErr.message = 'this password doesn\'t correct'
            throw passErr
        }
        req.user.password = newPass
        await req.user.save()
        res.json({ 
            changed:true
        })
        next()
    }catch(e){
        if(e.errors){
            return res.status(422).json(handValidationError(e))
        }
        res.status(403).json(e)
    }
}

const changeName = async (req,res,next) =>{
    const user = req.user
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    try{
        user.firstName = firstName
        user.lastName = lastName
        const updatedUser = await user.save()
        res.json(updatedUser)
    }catch(e){
        if(e.errors){
            return res.status(422).json(handValidationError(e))
        }
        res.status(500).json(e)
    }
}

const changePhoto = (req,res,next) =>{
    const user = req.user
    const oldImage = user.image
    uploadUserPhoto(req, res, function (err) {
        if (err) {
            return res.status(422).json(err)
        }
        if(!req.file){
            const noFileErr = new validationError()
            noFileErr.message = 'file must be choosen'
            noFileErr.code = 'INVALID'
            noFileErr.field = 'image'
            return res.status(422).json(noFileErr)
        }
        user.image = req.file.path
        user.save().then(doc=>{
            if(oldImage){
                deleteImage(oldImage)
            }
            res.json(doc)
            next()
        }).catch(e=>{
            res.status(500).json(e)
        })
    })
}

const deleteMyAccount = (req,res,next)=>{
    const user = req.user
    const userPhoto = user.image
    user.remove().then(()=>{
        deleteImage(userPhoto)
        res.json({ 
            deleted:true
        })
        next()
    }).catch(e=>{
        res.status(500).json(e)
    })
}

module.exports = {
    signUp,
    login,
    autoLogin,
    logOut,
    changePassword,
    changeName,
    changePhoto,
    deleteMyAccount,
}