const express = require('express')
const {authAdmin} = require('../middlewares/auth-admin')
const category = require('../controllers/category.controller')

const categoryRouter = express.Router()

categoryRouter.post('/add-category',authAdmin,category.addCategory)
categoryRouter.patch('/edit-category/:id',authAdmin,category.editCategory)
categoryRouter.delete('/delete-category/:id',authAdmin,category.deleteCategory)
categoryRouter.get('/get-categories',category.getCategories)

module.exports = {
    categoryRouter
}