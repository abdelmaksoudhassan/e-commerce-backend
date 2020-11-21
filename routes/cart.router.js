const express = require('express')
const cart = require('../controllers/cart.controller')
const {authUser} = require('../middlewares/auth-user')

const cartRouter = express.Router()

cartRouter.post('/add-to-cart/:productId',authUser,cart.addToCart)
cartRouter.post('/decrease-quantity/:productId',authUser,cart.decreaseQuantity)
cartRouter.delete('/remove-from-cart/:productId',authUser,cart.removeFromCart)
cartRouter.delete('/clear-cart',authUser,cart.clearCart)
cartRouter.get('/get-cart',authUser,cart.getCart)

module.exports = {
    cartRouter
}