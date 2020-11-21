const mongoose = require('mongoose')
require('dotenv').config({path: './vars.env'})

const database_url = process.env.DATABASE_URL
mongoose.connect(database_url,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log('connected to database')
}).catch(()=>{
    console.log('database connection error !!')
})