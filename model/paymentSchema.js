const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
    classId : {
        type:String,
        ref:'Class'
    },
    paymentStatus : {
        enum: ['pending' | 'success']
    },
    amount: {
        type :Number
    },
    student : {
        type:String,
        ref : 'Student'
    }
})

module.exports = mongoose.model('Payment', Schema)