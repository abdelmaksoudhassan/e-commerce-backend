const mongoose = require('mongoose')
const {Schema} = require('mongoose')
const validator = require('validator').default
const bcrypt = require('bcryptjs')
require('dotenv').config({path: './vars.env'})
const jwt = require('jsonwebtoken')
const {validationError} = require('../../classes/validation.error')

const minPasswordLength = process.env.MIN_PASSWORD_LENGTH
const minNameLength = process.env.MIN_NAME_LENGTH
const maxNameLength = process.env.MAX_NAME_LENGTH
const rounds = process.env.ROUNDS
const tokenKey = process.env.TOKEN_KEY

const baseOptions = {
    discriminatorKey: 'persontype', // our discriminator key, could be anything
    collection: 'persons', // the name of our collection
    timestamps:true
  };
const personSchema = new Schema({
    firstName:{
        type:String,
        minlength: [minNameLength,`this field must be minimum ${minNameLength}`],
        maxlength: [maxNameLength,`this field must be maximum ${maxNameLength}`],
        trim:true,
        validate:{
            validator:(value)=>{
                return validator.isAlpha(value)
            },message:'this field must be letters only'
        }
    },
    lastName:{
        minlength: [minNameLength,`this field must be minimum ${minNameLength}`],
        maxlength: [maxNameLength,`this field must be maximum ${maxNameLength}`],
        type:String,
        trim:true,
        validate:{
            validator:(value)=>{
                return validator.isAlpha(value)
            },message:'this field must be letters only'
        }
    },
    email:{
        required:[true,'this field is required'],
        type:String,
        trim:true,
        validate:{
            validator:(value)=>{
                return validator.isEmail(value)
            },message:'this field must be in email valid format'
        }
    },
    password:{
        required:[true,'this field is required'],
        type:String,
        minlength: [minPasswordLength,`this field must be minimum ${minPasswordLength}`]
    },
    image:{
        type:String,
    },
    tokens:[{
        token:{
            type:String
        }
    }]
},baseOptions)

personSchema.pre('save',async function(next){
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(rounds)
        const hashedPassword = await bcrypt.hash(this.password,salt)
        this.password = hashedPassword
    }
    next()
})

personSchema.methods.checkPassword = async function(password){
    const same = await bcrypt.compare(password,this.password)
    if(same){
        return Promise.resolve()
    }
    const passErr = new validationError()
    passErr.field = 'password',
    passErr.message = 'this password isn\'t correct',
    passErr.code = 'INVALID'
    return Promise.reject(passErr)
}
personSchema.methods.generateToken = async function(){
    const token = jwt.sign({id:this._id},tokenKey).toString()
    this.tokens.push({token})
    await this.save()
    return token
}
personSchema.methods.logOut = async function(){
    this.tokens = []
    await this.save()
}
personSchema.statics.findByToken = async function(token){
    try{
        const verify = await jwt.verify(token,tokenKey)
        const person = await this.findById(verify.id)
        return person
    }
    catch(e){
        const tokenErr = new validationError()
        tokenErr.field = 'token',
        tokenErr.message = 'this token isn\'t correct',
        tokenErr.code = 'INVALID'
        throw tokenErr
    }
}
var Person = mongoose.model('Person',personSchema)

module.exports = {
    Person
}