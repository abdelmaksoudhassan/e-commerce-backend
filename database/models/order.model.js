const mongoose = require('mongoose')
const {deleteImage} = require('../../functions/functions')
const {Product} = require('../../database/models/product.model')

const orderSchema = mongoose.Schema({
    products : [{
        productId:{
            required:true,
            ref:'Product',
            type:mongoose.Schema.Types.ObjectId
        },
        quantity:{
            required:true,
            type:Number
        }
    }],
    userId:{
        required:true,
        ref:'User',
        type:mongoose.Schema.Types.ObjectId
    }
},{
    timestamps:true
})
orderSchema.statics.addOrder = async function(user){
    const productIds = user.cart.map(item=>{return item.productId})
    Product.find({_id:{$in:productIds}}).cursor().eachAsync(async(p)=>{
        const neededQuantity = user.cart.find(item=>{
            return item.productId.toString() === p._id.toString()
        }).quantity
        
        if(neededQuantity === p.quantity){
            const removed = await p.remove()
            removed.images.forEach(image=>{deleteImage(image)});
        }else if(neededQuantity < p.quantity){
            p.quantity -= neededQuantity
            await p.save()
        }
        user.cart = []
        await user.save()
        const newOrder = new Order({
            products:{productId:p._id,quantity:neededQuantity},
            userId:user._id
        })
        await newOrder.save()
    })
}
const Order = mongoose.model('Order',orderSchema)

module.exports = {
    Order
}