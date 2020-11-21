const {Schema} = require('mongoose')
const {deleteImage} = require('../../functions/functions')
const {Person} = require('./person.model')

const adminSchema = new Schema()

adminSchema.virtual('products',{
    ref:'Product',
    localField:'_id',
    foreignField:'owner'
})
adminSchema.methods.toJSON = function(){
    const userObject = this.toObject()
    delete userObject._id
    delete userObject.password
    delete userObject.tokens
    delete userObject.persontype
    delete userObject.__v
    return userObject
}
adminSchema.pre('remove',function(next){
    deleteImage(this.image)
    next()
})
var Admin = Person.discriminator('Admin',adminSchema)
module.exports = {
    Admin
}