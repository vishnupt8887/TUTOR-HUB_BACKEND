const express = require('express')
const router = express.Router()
const jwt = require('../helpers/jwt')

const {
    adminlogin,
    studentLt, 
    tutorLt,
    tutorBlock,
    studentBlock
} = require('../controller/adminController')

router.post('/login',adminlogin)
router.get('/studentLt',jwt.verify,studentLt)
router.get('/tutorLt',jwt.verify,tutorLt)
router.patch('/tutorBlock',jwt.verify,tutorBlock)
router.patch('/studentBlock',jwt.verify,studentBlock)

module.exports = router