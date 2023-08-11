const express = require ('express')
const cors = require('cors')
const {db} = require('./config/dbConnection')
const socketIO = require('socket.io');
const {instrument} = require('@socket.io/admin-ui')
const path = require('path')

const {socketIoHelper} = require('./controller/socket')

const studentRouter = require('./routes/student')
const tutorRouter = require('./routes/tutor')
const adminRouter = require('./routes/admin')
const chatRouter = require('./routes/chat')
const app = express()
require('dotenv').config()

//dbconnection
db((arg)=>{
    if(arg){
         
    }else{
         
    }
})

//cors
const corsOption = {
    origin: "http://localhost:4200",
    methods: "GET,PUT,PATCH,POST,DELETE",
    allowedHeaders: 'Content-Type, Authorization',
    optionsSuccessStatus: 204
}
app.use(cors(corsOption))
app.use(express.static(path.join(__dirname,'public')))


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/student',studentRouter)
app.use('/tutor',tutorRouter)
app.use('/admin',adminRouter)
app.use('/chat',chatRouter)

const server =  app.listen(process.env.PORT,()=>{
     ;
})

const io = socketIO(server, {
    cors: {
      origin: ["https://admin.socket.io","http://localhost:4200", "http://localhost:5500"],
      credentials: true
    }
  });

  socketIoHelper(io)

  instrument(io,{auth:false})