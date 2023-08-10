const express = require('express')
const router = express.Router()
const {getChatRoom,chatRooms} = require('../controller/chatController')
const jwt = require('../helpers/jwt')

router.get('/getChats/:room',getChatRoom)

router.get('/getChatRooms',jwt.verify,chatRooms)

module.exports = router;