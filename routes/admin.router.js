const express = require('express')
const adminController = require('../controllers/admin.controller')
const {authAdmin} = require('../middlewares/auth-admin')

const adminRouter = express.Router()

adminRouter.post('/log-in',adminController.login)
adminRouter.get('/auto-log-in',adminController.autoLogin)
adminRouter.post('/log-out',authAdmin,adminController.logOut)
adminRouter.post('/add-admin',authAdmin,adminController.addAdmin)
adminRouter.get('/get-admins',authAdmin,adminController.getAdmins)
adminRouter.delete('/delete-admin/:email',authAdmin,adminController.deleteAdmin)
adminRouter.patch('/change-password',authAdmin,adminController.changePassword)
adminRouter.patch('/change-name',authAdmin,adminController.changeName)
adminRouter.post('/change-photo',authAdmin,adminController.changePhoto)

module.exports = {
    adminRouter
}