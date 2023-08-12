const mongoose = require('mongoose')
const {Types} = require('mongoose')


const chatScheme = new mongoose.Schema({
   name:{type:String,
    index:true,
},



   messages:{type:[{
    student:{
        type:Types.ObjectId,
        ref:'Student'
    },
    tutor:{
        type:Types.ObjectId,
        ref:'Tutor'
    },
    message:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now()
    }
   }],
   default:[]
}
})

module.exports=  mongoose.model('Chat',chatScheme)