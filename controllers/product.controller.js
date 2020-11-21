const {Product} = require('../database/models/product.model')
const {isValidObjectId} = require('mongoose')
const {deleteImage,handValidationError,uploadProductImages} = require('../functions/functions')
const {validationError} = require('../classes/validation.error')

const addProduct = (req,res,next) =>{
    uploadProductImages(req,res,function(err){
        if(err){
            return res.status(422).json(err)
        }
        if(req.files.length === 0){
            const noFileErr = new validationError()
            noFileErr.message = 'upload at least on image'
            noFileErr.code = 'INVALID'
            noFileErr.field = 'image'
            return res.status(422).json(noFileErr)
        }
        const images = []
        req.files.forEach(img=>images.push(img.path))
        const product = new Product({
            title:req.body.title,
            price:req.body.price,
            category:req.body.category,
            description:req.body.description,
            categoryId:req.body.categoryId,
            quantity:req.body.quantity,
            owner:req.admin._id,
            images:images
        })
        product.save().then(doc=>{
            res.json(doc)
            next()
        }).catch(e=>{
            images.forEach(path=>deleteImage(path))
            if(e.errors){
                return res.status(422).json(e.errors)
            }
            res.status(422).json(e)
        })
    })
}

const getProduct = async (req,res,next) =>{
    const id = req.params.id
    if(!isValidObjectId(id)){
        const idErr = new validationError()
        idErr.message = 'id must be in valid format'
        idErr.code = 'INVALID'
        idErr.field = 'id'
        return res.status(400).send(idErr)
    }
    try{
        const product = await Product.findById(id)
        if(!product){
            const productErr = new validationError()
            productErr.message = 'product with this id doesn\'t exist'
            productErr.code = 'NOTFOUND'
            productErr.field = 'id'
            throw productErr
        }
        await product.populate('categoryId').populate('owner').execPopulate()
        res.json(product)
        next()
    }
    catch(e){
        res.status(404).json(e)
    }
}
const deleteProduct = (req,res,next) => {
    const id = req.params.id
    if(!isValidObjectId(id)){
        const idErr = new validationError()
        idErr.message = 'id must be in valid format'
        idErr.code = 'INVALID'
        idErr.field = 'id'
        return res.status(400).json(idErr)
    }
    Product.findOneAndDelete({_id:id},(err,doc)=>{
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
        doc.images.forEach(path=>deleteImage(path))
        res.json({
            deleted:true
        })
        next()
    })
}
const editProduct = (req,res,next)=>{
    const id = req.params.id
    if(!isValidObjectId(id)){
        const idErr = new validationError()
        idErr.message = 'id must be in valid format'
        idErr.code = 'INVALID'
        idErr.field = 'id'
        return res.status(400).json(idErr)
    }
    const admin = req.admin
    uploadProductImages(req,res,function(err){
        if(err){
            return res.status(422).json(err)
        }
        if(req.files){
            var newImages = []
            req.files.forEach(img=>newImages.push(img.path))
        }
        Product.findOneAndUpdate({
            _id:id,
            owner:admin._id
        },{
            $set:{
                title:req.body.title,
                price:req.body.price,
                quantity:req.body.quantity,
                categoryId:req.body.categoryId,
                description:req.body.description,
            },
            $addToSet:{
                images:{
                    $each : newImages
                }
            }},{
                useFindAndModify:false,
                new:true
            },(err,doc)=>{
                if(err){
                    newImages.forEach(path=>deleteImage(path))
                    if(err.errors){
                        return res.status(442).json(handValidationError(err))
                    }
                    return res.status(422).json(err)
                }
                if(!doc){
                    newImages.forEach(path=>deleteImage(path))
                    const productErr = new validationError()
                    productErr.message = 'product with this id doesn\'t exist'
                    productErr.code = 'NOTFOUND'
                    productErr.field = 'id'
                    return res.status(404).json(productErr)
                }
            doc.populate('categoryId').populate('owner').execPopulate().then(pop=>{
                res.json(pop)
                next()
            }).catch(e=>{
                res.status(500).json(e)
            })
        })
    })
}

const getAdminProducts = async(req,res,next) =>{
    const page = +req.query.page
    const limit = +req.query.count
    let total
    Product.find({owner:req.admin._id}).countDocuments().then(count=>{
        total = count
        return Product.find({owner:req.admin._id}).populate('categoryId').limit(limit).skip((page-1)*limit)
    }).then(docs=>{
        res.json({
            products:docs,
            currentPage:page,
            hasNextPage: limit*page<total,
            hasPreviousPage: page>1,
            nextPage: ((total/(limit*page) >1) ? page+1 : null),
            previousPage: (page>1 ? page-1 : null ),
            lastPage:Math.ceil(total/limit),
            total:total
        })
        next()
    }).catch(err=>{
        res.status(500).json(err)
    })
}
const getAllProducts = (req,res,next)=>{
    const page = +req.query.page
    const limit = +req.query.count
    let total
    Product.find().countDocuments().then(count=>{
        total = count
        return Product.find().populate('categoryId').populate('owner').limit(limit).skip((page-1)*limit)
    }).then(docs=>{
        res.json({
            products:docs,
            currentPage:page,
            hasNextPage: limit*page<total,
            hasPreviousPage: page>1,
            nextPage: ((total/(limit*page) >1) ? page+1 : null),
            previousPage: (page>1 ? page-1 : null ),
            lastPage:Math.ceil(total/limit),
            total:total
        })
        next()
    }).catch(err=>{
        res.status(500).json(err)
    })
}

module.exports = {
    addProduct,
    getProduct,
    deleteProduct,
    editProduct,
    getAdminProducts,
    getAllProducts
}