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
    studentInClass,
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
router.post('/assignmentAdd/:clsId',jwt.verify,upload.single('pdf'),assignmentAdd)
router.get('/assignmentFetch/:id/:currentpage/:pagesize',jwt.verify,assignmentFetch)
router.get('/paginatedData/:currentpage/:pagesize',jwt.verify,paginationData)
router.get('/tutorCheck',jwt.verify,tutorCheck)
router.post('/videoUpload/:clsId',jwt.verify,videoUpload.single('video'),videoUploads)
router.get('/videoFetch/:id/:currentpage/:pagesize',jwt.verify,videoFetch)
router.post('/questionAdd/:clsId',jwt.verify,upload.single('pdf'),questionAdd)
router.get('/questionFetch/:id/:currentpage/:pagesize',jwt.verify,questionFetch)
router.get('/studentsInClass/:id/:currentpage/:pagesize',jwt.verify,studentInClass)
router.get('/questionDelete/:id/:clsId',jwt.verify,questionDelete)
router.get('/assignmentDelete/:id/:clsId',jwt.verify,assignmentDelete)
router.get('/videoDelete/:id/:clsId',jwt.verify,videoDelete)

module.exports = router