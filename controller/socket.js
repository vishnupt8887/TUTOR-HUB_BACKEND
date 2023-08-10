let count;
const chatRooms = require('../model/chatSchema')
module.exports = {
    
    socketIoHelper : (io)=>{
        try {
            
            io.on('connection',(socket)=> {
                console.log('io connected');
         


            socket.on('join', (data) => {  
                socket.join(data.room);
                console.log(data.room,'room')  
                
                
                
                chatRooms.find({}).then((rooms)=>{
                    count = 0;
                    rooms.forEach((room) => {
                      console.log(room.name,'jjjjkkk',data.room)
                        if(room.name == data.room){
                          
                            count++;
                            console.log(count,'count')
                        }
                    });
                    // Create the chatRoom if not already created
                    console.log(count,'count')
                    if(count == 0) {
                      console.log('inserting chat room')
                      const cr = new chatRooms({
                        name:data.room
                      })
                     cr.save()
                        // chatRooms.create({ name: data.room, messages: [] }); 
                    }
                }).catch((e)=>{
                    console.log(e);
                })
            })

            socket.on('message', (data) => {
                console.log('new meaage............/////','',data)
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
          
                console.log(upt,'upt');
             
                chatRooms.updateOne({name: data.room},{$push:upt}).then((res)=> {
                      console.log(res);
                }).catch((e)=>{
                    console.log(e);
                })
              });

            })
        } catch (error) {
            console.log(error,'socket error')
         
        }
    }
}