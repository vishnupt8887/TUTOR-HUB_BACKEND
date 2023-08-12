const express = require('express')
const router = express.Router()
const {getChatRoom,chatRooms} = require('../controller/chatController')
const jwt = require('../helpers/jwt')

router.get('/getChats/:room',jwt.verify,getChatRoom)

router.get('/getChatRooms/:classId',jwt.verify,chatRooms)

module.exports = router;