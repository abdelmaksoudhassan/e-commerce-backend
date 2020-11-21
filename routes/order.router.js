const express = require('express')
const {authUser} = require('../middlewares/auth-user')
const {authAdmin} = require('../middlewares/auth-admin')
const order = require('../controllers/order.controller')

const orderRouter= express.Router()

orderRouter.post('/make-order',authUser,order.makeOrder)
orderRouter.get('/get-all-orders',order.getOrders)
orderRouter.delete('/delete-order/:id',authAdmin,order.removeOrder)

module.exports = {
    orderRouter
}