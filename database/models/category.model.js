const mongoose = require('mongoose')
const {Product} = require('../models/product.model')
const {deleteImage} = require('../../functions/functions')
require('dotenv').config({path: './vars.env'})

const minNameLength = process.env.MIN_NAME_LENGTH
const maxNameLength = process.env.MAX_NAME_LENGTH
const lettersNumbersSpaces_regEx = /^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$/

const categorySchema = new mongoose.Schema({
    title:{
        required:[true,'this field is required'],
        type:String,
        minlength: [minNameLength,`this field must be minimum ${minNameLength}`],
        maxlength: [maxNameLength,`this field must be maximum ${maxNameLength}`],
        validate:{
            validator:(value)=>{
                return lettersNumbersSpaces_regEx.test(value)
            },message:'this field support letters or numbers or spaces or underscore'
        }
    }
},{
    timestamps:true
})
categorySchema.methods.toJSON = function(){
    const category = this.toObject()
    delete category.__v
    return category
}
categorySchema.pre('remove',async function(next){
    const products = await Product.find({categoryId:this._id})
    products.forEach(item=>{
        item.images.forEach(image=>{deleteImage(image)})
    })
    await Product.deleteMany({categoryId:this._id})
    next()
})
categorySchema.pre('findOneAndUpdate',function(next){
    this.options.runValidators = true;
    next();
})
const Category = mongoose.model('Category',categorySchema)
module.exports = {
    Category
}