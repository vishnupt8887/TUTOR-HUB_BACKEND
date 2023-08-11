const mongoose = require('mongoose')

module.exports.db= function (cb){
    mongoose.connect(process.env.DATABASEURL)
    const db = mongoose.connection
    db.once('open',()=>{
        cb(true)
    })
    db.on('error',(err)=>{
         
        cb(false)
    })
}