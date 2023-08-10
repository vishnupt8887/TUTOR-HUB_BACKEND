const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
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
    class:{
        type : String,
        required : false
    },
    school:{
        type : String,
        required : false
    },
    access:{
        type : Boolean,
        default : true
    }
})

module.exports = mongoose.model('Student',studentSchema)