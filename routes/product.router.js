const express = require('express')
const productController = require('../controllers/product.controller')
const {authAdmin} = require('../middlewares/auth-admin')

const productRouter = express.Router()

productRouter.post('/add-product',authAdmin,productController.addProduct)
productRouter.get('/get-product/:id',productController.getProduct)
productRouter.delete('/delete-product/:id',authAdmin,productController.deleteProduct)
productRouter.patch('/edit-product/:id',authAdmin,productController.editProduct)
productRouter.get('/get-admin-products',authAdmin,productController.getAdminProducts)
productRouter.get('/get-all-products',productController.getAllProducts)

module.exports = {
    productRouter
}