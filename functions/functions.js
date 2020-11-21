const multer = require('multer')
const fs = require('fs')
const {validationError} = require('../classes/validation.error')
const path = require('path')

const user_fileStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
     cb(null,'database/images/users')
    },
    filename:(req,file,cb)=>{
        cb(null,(Date.now()+'-'+file.originalname).replace(/ /g,""))
    }
})
const admin_fileStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
     cb(null,'database/images/admins')
    },
    filename:(req,file,cb)=>{
        cb(null,(Date.now()+'-'+file.originalname).replace(/ /g,""))
    }
})
const product_fileStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'database/images/products')
    },
    filename:(req,file,cb)=>{
        cb(null,(Date.now()+'-'+file.originalname).replace(/ /g,''))
    }
})

const imageFileFilter = (req,file,cb)=>{
    const extension = path.extname(file.originalname)
    if((extension == '.png')||(extension == '.jpg')||(extension === '.jpeg')){
        cb(null,true)
    }else{
        const filterErr = new validationError()
        filterErr.message = 'file must be image'
        filterErr.code = 'INVALID'
        filterErr.field = 'image'
        cb(filterErr,false)
    }
}
const imageFileSize = {fileSize : 512*1024} //512 kb
const uploadUserPhoto = multer({
        storage:user_fileStorage,
        fileFilter:imageFileFilter,
        limits:imageFileSize
    }).single('image')
const uploadAdminPhoto = multer({
        storage:admin_fileStorage,
        fileFilter:imageFileFilter,
        limits:imageFileSize
    }).single('image')
const uploadProductImages = multer({
        storage:product_fileStorage,
        fileFilter:imageFileFilter,
        limits:imageFileSize
    }).array('productImages')

const deleteImage = (path) =>{
    if(!!path){
        fs.unlink(path,()=>{
            console.log('image deleted')
        })
    }
}
const handValidationError = (e) =>{
    const err = {}
    for (const key in e.errors) {
        if (e.errors.hasOwnProperty(key)) {
            err[key] = e.errors[key].properties;
        }
    }
    return err
}
module.exports = {
    uploadUserPhoto,
    uploadAdminPhoto,
    uploadProductImages,
    deleteImage,
    handValidationError
}