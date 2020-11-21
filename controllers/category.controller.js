const {Category} = require('../database/models/category.model')
const {handValidationError} = require('../functions/functions')
const {validationError} = require('../classes/validation.error')
const _ = require('lodash')
const {isValidObjectId} = require('mongoose')

const addCategory= (req,res,next)=>{
    Category.find({title:req.body.title}).then(docs=>{
        if(_.isEmpty(docs)){
            Category.create({
                title:req.body.title
            }).then(doc=>{
                res.json(doc)
                next()
            }).catch(err=>{
                if(err.errors){
                    return res.status(422).json(handValidationError(err))
                }
                res.status(422).json(err)
            })
        }else{
            const catErr = new validationError()
            catErr.code = 'DUPLICATED'
            catErr.message = 'category with this name already exist'
            catErr.field = 'title'
            res.status(422).json(catErr) 
        }
    }).catch(e=>{
        res.status(500).json(e)
    })
}

const editCategory= (req,res,next)=>{
    const id = req.params.id
    const title = req.body.title
    if(!isValidObjectId(id)){
        const idErr = new validationError()
        idErr.message = 'id must be in valid format'
        idErr.code = 'INVALID'
        idErr.field = 'id'
        return res.status(400).send(idErr)
    }
    Category.findOneAndUpdate({_id:id},{$set:{ title: title}},{new:true,useFindAndModify:false},(err,doc)=>{
        if(err){
            if(err.errors){
                return res.status(422).json(handValidationError(err))
            }
            return res.status(422).json(err)
        }
        if(!doc){
            const catErr = new validationError()
            catErr.message = 'category with this id doesn\'t exist'
            catErr.code = 'NOTFOUND'
            catErr.field = 'id'
            return res.status(404).json(catErr)
        }
        res.json(doc)
        next()
    })
}
const deleteCategory= async (req,res,next)=>{
    const id = req.params.id
    if(!isValidObjectId(id)){
        const idErr = new validationError()
        idErr.message = 'id must be in valid format'
        idErr.code = 'INVALID'
        idErr.field = 'id'
        return res.status(400).send(idErr)
    }
    const category = await Category.findById(id)
    if(!category){
        const catErr = new validationError()
        catErr.message = 'category with this id doesn\'t exist'
        catErr.code = 'NOTFOUND'
        catErr.field = 'id'
        return res.status(404).json(catErr)
    }
    await category.remove()
    res.json({ 
        deleted:true
    })
    next()
}

const getCategories = (req,res,next) =>{
    Category.find((err,doc)=>{
        if(err){
            return res.status(500).json(err)
        }
        res.json(doc)
        next()
    })
}

module.exports = {
    addCategory,
    editCategory,
    deleteCategory,
    getCategories
}