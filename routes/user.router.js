const express = require('express')
const userController = require('../controllers/user.controller')
const {authUser} = require('../middlewares/auth-user')

const userRouter = express.Router()

userRouter.post('/sign-up',userController.signUp)
userRouter.post('/log-in',userController.login)
userRouter.get('/auto-log-in',userController.autoLogin)
userRouter.post('/log-out',authUser,userController.logOut)
userRouter.patch('/change-password',authUser,userController.changePassword)
userRouter.patch('/change-name',authUser,userController.changeName)
userRouter.post('/change-photo',authUser,userController.changePhoto)
userRouter.delete('/delete-my-account',authUser,userController.deleteMyAccount)

module.exports = {
    userRouter
}