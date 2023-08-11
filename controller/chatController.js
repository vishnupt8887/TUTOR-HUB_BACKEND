const chatRooms = require('../model/chatSchema')
const student = require('../model/studentSchema')
module.exports = {
    getChatRoom:(req, res, next) => {
         
        // Array<{tutor?: String ,student? : String,userName:String, message: {msg:any,date:Date}}>
        let messages
        let room = req.params.room;
        chatRooms.find({name:room}).populate({path:'messages.student',select:'_id name'})
        .populate({path:'messages.tutor',select:'_id name'}).then((data)=>{
             ;
            messages = data
            if(data.length > 0){
                messages = data[0].messages.map(message =>{
                     ;
                     return ({
                    
                    student: message?.student?._id,
                    tutor: message?.tutor?._id,
                    userName: message?.student?.name ?? message?.tutor?.name,
                    message:{msg:message.message,date: message.date}
                    
                  })})
            }
                ;
            res.status(200).json({data:messages})
           
        })
    },
     chatRooms:async(req,res,next) =>{
      try {
        
        const tutorId = res.locals.jwtUSER._id
        ;
    const chatrooms = await chatRooms.find({}).select({name:1,_id:0})
 
   chatrooms.forEach((element,i) => {
    if (element.name.includes(tutorId)) {
      // If present, remove string2 from string1
      element.name = element.name.substring(element.name.length - 24);
    }else{
      chatrooms.splice(i,1)
    }
   });
  
   const chatSample = await student.find({_id:{$in:chatrooms.map(obj=> obj.name)}}).select({name:1,email:1}) 
   
    

    res.status(200).json({
        data:chatSample
    })

      } catch (error) {
         ;
      }
    }
}