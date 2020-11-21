const {Admin} = require('../database/models/admin.model')
const {validationError} = require('../classes/validation.error')

const authAdmin = async(req,res,next) => {
    const token = req.header('token')
    try{
        let admin = await Admin.findByToken(token)
        if(!admin){
            const adminErr = new validationError()
            adminErr.code = 'UNAUTHORIZED'
            adminErr.field = 'token'
            adminErr.message = 'this token is expired'
            throw adminErr
        }
        req.admin = admin
        next()
    }
    catch(e){
        res.status(401).json(e)
    }
}

module.exports = {
    authAdmin
}