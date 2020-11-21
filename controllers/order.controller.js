const _ = require('lodash')
const {validationError} = require('../classes/validation.error')
const {Order} = require('../database/models/order.model')
const {isValidObjectId} = require('mongoose')

const makeOrder = (req,res,next)=>{
    const user = req.user
    if(_.isEmpty(user.cart)){
        const cartErr = new Error()
        cartErr.message = 'this cart is empty'
        cartErr.code = 'INVALID'
        return res.status(422).json(cartErr)
    }
    Order.addOrder(user).then(orderData=>{
        res.json({
            created:true,
            order:'success'
        })
        next()
    }).catch(e=>{
        res.status(500).json(e)
    })
}

const getOrders = (req,res,next) =>{
    const page = +req.query.page
    const limit = +req.query.count
    let total
    Order.find().countDocuments().then(count=>{
        total = count
        return Order.find().limit(limit).skip((page-1)*limit).populate('userId').populate('products.productId').exec()
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

const removeOrder = (req,res,next)=>{
    const id = req.params.id
    if(!isValidObjectId(id)){
        const idErr = new validationError()
        idErr.message = 'id must be in valid format'
        idErr.code = 'INVALID'
        idErr.field = 'id'
        return res.status(400).json(idErr)
    }
    Order.findOneAndDelete({_id:id},(err,doc)=>{
        if(err){
            return res.status(500).json(err)
        }
        if(!doc){
            const orderErr = new validationError()
            orderErr.message = 'order with this id doesn\'t exist'
            orderErr.code = 'NOTFOUND'
            orderErr.field = 'order'
            return res.status(404).json(orderErr)
        }
        res.json({
            deleted:true,
            succeeded:true
        })
        next()
    })
}

module.exports = {
    makeOrder,
    getOrders,
    removeOrder
}