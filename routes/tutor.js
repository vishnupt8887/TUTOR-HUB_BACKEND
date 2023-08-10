const express = require('express')
const router = express.Router()
const jwt = require('../helpers/jwt')
const emailCheck = require("../helpers/emailVerify")
const {upload,videoUpload} = require('../middleware/multer')
const {
    signup,
    login,
    otpEmail,
    otpCheck,
    tutors,
    classPost,
    classData,
    classDetail,
    classDataEdit,
    editClass,
    classDelete,
    assignmentAdd,
    assignmentFetch,
    paginationData,
    tutorCheck,
    videoUploads,
    videoFetch,
    questionFetch,
    questionAdd,
    questionDelete,
    assignmentDelete,
    videoDelete,
} = require('../controller/tutorController')

router.post('/signup',signup)
router.post('/login',login)
router.get('/otpEmail',jwt.verify,otpEmail)
router.post('/otpCheck',jwt.verify,otpCheck)
router.get('/tutors',jwt.verify,tutors)
router.post('/classpost',jwt.verify,classPost)
router.get('/classData',jwt.verify,classData)
router.get('/classDetail/:id',jwt.verify,classDetail)
router.post('/editClass',jwt.verify,editClass)
router.get('/classDataEdit/:id',jwt.verify,classDataEdit)
router.get('/classDelete/:id',jwt.verify,classDelete)
router.post('/assignmentAdd/:clsId',upload.single('pdf'),jwt.verify,assignmentAdd)
router.get('/assignmentFetch/:id/:currentpage/:pagesize',assignmentFetch)
router.get('/paginatedData/:currentpage/:pagesize',jwt.verify,paginationData)
router.get('/tutorCheck',jwt.verify,tutorCheck)
router.post('/videoUpload/:clsId',videoUpload.single('video'),videoUploads)
router.get('/videoFetch/:id/:currentpage/:pagesize',videoFetch)
router.post('/questionAdd/:clsId',upload.single('pdf'),jwt.verify,questionAdd)
router.get('/questionFetch/:id/:currentpage/:pagesize',questionFetch)
router.get('/questionDelete/:id/:clsId',questionDelete)
router.get('/assignmentDelete/:id/:clsId',assignmentDelete)
router.get('/videoDelete/:id/:clsId',videoDelete)

module.exports = router