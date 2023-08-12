const express = require('express')
const jwt = require('../helpers/jwt')
const router = express.Router()
const {
    signup,
    login,
    classData,
    classDetail,
    classIn,
    paginationData,
    studentCheck,
    ratingData,
    questionFetch,
    assignmentFetch,
    videoFetch,
    paymentStart,
    verifyPayment,
    studentClass
} = require('../controller/studentController')


router.post('/signup',signup)
router.post('/login',login)
router.get('/classData',jwt.verify,classData)
router.post('/classDet',jwt.verify,classDetail)
router.get('/classIn/:id',jwt.verify,classIn)
router.get('/paginatedData/:currentpage/:pagesize',jwt.verify,paginationData)
router.get('/studentCheck',jwt.verify,studentCheck)
router.post('/reviewSubmit',jwt.verify,ratingData)
router.get('/questionFetch/:id/:currentpage/:pagesize',jwt.verify,questionFetch)
router.get('/assignmentFetch/:id/:currentpage/:pagesize',jwt.verify,assignmentFetch)
router.get('/videoFetch/:id/:currentpage/:pagesize',jwt.verify,videoFetch)
router.get('/studentClass/:currentpage/:pagesize',jwt.verify,studentClass)
router.post('/paymentStart',jwt.verify,paymentStart)
router.post('/verifyPayment',jwt.verify,verifyPayment)
module.exports = router