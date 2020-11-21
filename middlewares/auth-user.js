const {User} = require('../database/models/user.model')
const {validationError} = require('../classes/validation.error')

const authUser = async(req,res,next) => {
    const token = req.header('token')
    try{
        const user = await User.findByToken(token)
        if(!user){
            const userErr = new validationError()
            userErr.code = 'UNAUTHORIZED'
            userErr.field = 'token'
            userErr.message = 'this token is expired'
            throw userErr
        }
        req.user = user
        next()
    }
    catch(e){
        res.status(401).json(e)
    }
}

module.exports = {
    authUser
}