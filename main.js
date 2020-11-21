const bodyParser = require('body-parser')
const express = require('express')
const {userRouter} = require('./routes/user.router')
const {adminRouter} = require('./routes/admin.router')
const {productRouter} = require('./routes/product.router')
const {cartRouter} = require('./routes/cart.router')
const {orderRouter} = require('./routes/order.router')
const {categoryRouter} = require('./routes/category.router')

require('./database/connection')
require('dotenv').config({ path:'./vars.env' })

const app = express()
const port = process.env.PORT || 3000

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, User-Token, Token');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(bodyParser.json())
app.use('/user',userRouter)
app.use('/admin',adminRouter)
app.use(productRouter)
app.use(cartRouter)
app.use(orderRouter)
app.use(categoryRouter)

app.use('/users',express.static(__dirname))
app.use('/admins',express.static(__dirname))
app.use('/products',express.static(__dirname))

app.listen(port,()=>{
    console.log(`connected to port ${port}`)
})