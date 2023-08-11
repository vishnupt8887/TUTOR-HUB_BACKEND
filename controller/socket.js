let count;
const chatRooms = require('../model/chatSchema')
module.exports = {
    
    socketIoHelper : (io)=>{
        try {
            
            io.on('connection',(socket)=> {
                 ;
         


            socket.on('join', (data) => {  
                socket.join(data.room);
                   
                
                
                
                chatRooms.find({}).then((rooms)=>{
                    count = 0;
                    rooms.forEach((room) => {
                       
                        if(room.name == data.room){
                          
                            count++;
                             
                        }
                    });
                    // Create the chatRoom if not already created
                     
                    if(count == 0) {
                       
                      const cr = new chatRooms({
                        name:data.room
                      })
                     cr.save()
                        // chatRooms.create({ name: data.room, messages: [] }); 
                    }
                }).catch((e)=>{
                     ;
                })
            })

            socket.on('message', (data) => {
                 
                // emitting the 'new message' event to the clients in that room
                let upt = {messages:{}}
                if( data?.student ) {
                    upt.messages = {student:data.user,message:data.message}
                    io.to(data.room).emit('new message', {student: data.user,userName:data.userName ,message:{msg:data.message,date:Date.now()}});
                  }  else{
                    upt.messages = {tutor:data.user,message:data.message}
                    io.to(data.room).emit('new message', {tutor: data.user,userName:data.userName ,message:{msg:data.message,date:Date.now()}});
                  }

               
                // save the message in the 'messages' array of that chat-room
          
                 ;
             
                chatRooms.updateOne({name: data.room},{$push:upt}).then((res)=> {
                       ;
                }).catch((e)=>{
                     ;
                })
              });

            })
        } catch (error) {
             
         
        }
    }
}