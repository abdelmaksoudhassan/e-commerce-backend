const {validationError} = require('../classes/validation.error')
const {isValidObjectId} = require('mongoose')
const {Product} = require('../database/models/product.model')

const addToCart = (req,res,next) =>{
    const user = req.user
    const productId = req.params.productId
    if(!isValidObjectId(productId)){
        const idErr = new validationError()
        idErr.message = 'id must be in valid format'
        idErr.code = 'INVALID'
        idErr.field = 'id'
        return res.status(422).json(idErr)
    }
    Product.findById(productId,(err,doc)=>{
        if(err){
            return res.status(500).json(err)
        }
        if(!doc){
            const productErr = new validationError()
            productErr.message = 'product with this id doesn\'t exist'
            productErr.code = 'NOTFOUND'
            productErr.field = 'id'
            return res.status(404).json(productErr)
        }
        user.addToCart(doc).then(userData=>{
            userData.cartDetails(userData.cart).then(cartData=>{
                res.json(cartData)
                next()
            }).catch(e=>{
                res.status(500).json(e)
            })
        }).catch(e=>{
            res.status(500).json(e)
        })
    })
}

const decreaseQuantity = (req,res,next) =>{
    const user = req.user
    const productId = req.params.productId
    if(!isValidObjectId(productId)){
        const idErr = new validationError()
        idErr.message = 'id must be in valid format'
        idErr.code = 'INVALID'
        idErr.field = 'id'
        return res.status(400).json(idErr)
    }
    Product.findById(productId,(err,doc)=>{
        if(err){
            return res.status(500).json(err)
        }
        if(!doc){
            const productErr = new validationError()
            productErr.message = 'product with this id doesn\'t exist'
            productErr.code = 'NOTFOUND'
            productErr.field = 'id'
            return res.status(404).json(productErr)
        }
        user.decreaseQuantity(doc).then(userData=>{
            userData.cartDetails(userData.cart).then(cartData=>{
                res.json(cartData)
                next()
            }).catch(e=>{
                res.status(500).json(e)
            })
        }).catch(e=>{
            res.status(500).json(e)
        })
    })
}
const removeFromCart = (req,res,next) =>{
    const user = req.user
    const productId = req.params.productId
    if(!isValidObjectId(productId)){
        const idErr = new validationError()
        idErr.message = 'id must be in valid format'
        idErr.code = 'INVALID'
        idErr.field = 'id'
        return res.status(400).json(idErr)
    }
    user.removeFromCart(productId).then(userData=>{
        userData.cartDetails(userData.cart).then(cartData=>{
            res.json(cartData)
            next()
        }).catch(e=>{
            res.status(500).json(e)
        })
    }).catch(e=>{
        res.status(500).json(e)
    })
}
const clearCart = (req,res,next) =>{
    const user = req.user
    user.clearCart().then(()=>{
        res.json({cart:[]})
        next()
    }).catch(e=>{
        res.status(500).json(e)
    })
}
const getCart = (req,res,next) =>{
    const user = req.user
    user.cartDetails().then(userData=>{
        res.json(userData)
        next()
    }).catch(e=>{
        console.log(e)
        res.status(500).json(e)
    })
}
module.exports = {
    addToCart,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    getCart
}