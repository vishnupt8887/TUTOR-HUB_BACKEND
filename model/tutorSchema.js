const mongoose = require('mongoose')

const tutorSchema = new mongoose.Schema({
    name:{
        type : String,
        required : true
    },
    email:{
        type : String,
        required : true,
        unique : true
    },
    password:{
        type : String,
        required : true
    },
    phone:{
        type : Number,
        required : true
    },
    photo:{
        type : String,
        required : false
    },
    access:{
        type : Boolean,
        default : true
    },
    verified:{
        type : Boolean,
        default : false
    },
    resetToken:{
        type : String
    },
    expTime:{
        type : Date
    }
})



module.exports = mongoose.model('Tutor',tutorSchema)