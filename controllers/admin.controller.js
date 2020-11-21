const {Admin} = require('../database/models/admin.model')
const {Person} = require('../database/models/person.model')
const {uploadAdminPhoto,deleteImage,handValidationError} = require('../functions/functions')
const _ = require('lodash')
const {validationError} = require('../classes/validation.error')
const {compare} = require('bcryptjs')

const login = async (req,res,next) =>{
    const email = req.body.email
    const password = req.body.password
    try{
        const admins = await Admin.find({email:email})
        if(_.isEmpty(admins)){
            const notFoundEmailErr = new validationError()
            notFoundEmailErr.field = 'email'
            notFoundEmailErr.message = 'this email doesn\'t exist'
            notFoundEmailErr.code = 'NOTFOUND'
            throw notFoundEmailErr
        }
        const admin = admins[0]
        await admin.checkPassword(password)
        const token = await admin.generateToken()
        res.json({admin,token})
        next()
    }
    catch(e){
        res.status(401).json(e)
    }
}

const autoLogin = async (req,res,next) =>{
    const token = req.header('token')
    try{
        const admin = await Admin.findByToken(token)
        if(!admin){
            const adminErr = new validationError()
            adminErr.code = 'UNAUTHORIZED'
            adminErr.field = 'token'
            adminErr.message = 'this token is expired'
            throw adminErr
        }
        res.json({admin,token})
        next()
    }
    catch(e){
        res.status(401).json(e)
    }
}

const addAdmin = async (req,res,next) => {
    const email = req.body.email
    const password = req.body.password
    try{
        let persons = await Person.find({email})
        if(! _.isEmpty(persons)){
            const emailErr = new validationError()
            emailErr.field = 'email',
            emailErr.message = 'this email already used',
            emailErr.code = 'DUPLICATED'
            throw emailErr
        }
        const admin = await Admin.create({email,password})
        res.status(201).json(admin)
        next()
    }
    catch(e){
        if(e.errors){
            return res.status(422).json(handValidationError(e))
        }
        res.status(422).json(e)
    }
}

const logOut = (req,res,next) =>{
    const admin = req.admin
    try{
        admin.logOut()
        res.json({ 
            logged_out:true
        })
        next()
    }
    catch(e){
        res.status(500).json(e)
    }
}
const getAdmins = (req,res,next) =>{
    const myEmail = req.admin.email
    Admin.find({email:{$ne:myEmail}}).then(docs=>{
        res.json(docs)
        next()
    }).catch(err=>{
        res.status(500).json(err)
    })
}
const changePassword = async (req,res,next) =>{
    const oldPass = req.body.oldPassword
    const newPass = req.body.newPassword
    try{
        const same = await compare(oldPass,req.admin.password)
        if(!same){
            const passErr = new validationError()
            passErr.code = 'INVALID'
            passErr.field = 'oldPassword'
            passErr.message = 'this password doesn\'t correct'
            throw passErr
        }
        req.admin.password = newPass
        await req.admin.save()
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
    const admin = req.admin
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    try{
        admin.firstName = firstName
        admin.lastName = lastName
        const updatedAdmin = await admin.save()
        res.json(updatedAdmin)
    }catch(e){
        if(e.errors){
            return res.status(422).json(handValidationError(e))
        }
        res.status(500).json(e)
    }
}

const changePhoto = (req,res,next) =>{
    const admin = req.admin
    const oldImage = admin.image
    uploadAdminPhoto(req, res, function (err) {
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
        admin.image = req.file.path
        admin.save().then(doc=>{
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

const deleteAdmin = async(req,res,next)=>{
    const email = req.params.email
    try{
        const admin = await Admin.findOne({email})
        await admin.remove()
        res.json({ 
            deleted:true
        })
        next()
    }catch(e){
        res.status(500).json(e)
    }
}

module.exports = {
    login,
    autoLogin,
    addAdmin,
    logOut,
    getAdmins,
    changePassword,
    changeName,
    changePhoto,
    deleteAdmin,
}