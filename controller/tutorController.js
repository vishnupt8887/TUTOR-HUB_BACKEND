const tutors = require('../model/tutorSchema')
const bcrypt = require('bcrypt')
const jwt = require('../helpers/jwt')
const nodemailer = require('nodemailer')
const classes = require('../model/classSchema')





module.exports = {
    signup: async (req, res) => {
        try {
            console.log(req.body, 'bodyyyy');
            // let apiRes = {}
            if (req.body.name &&
                req.body.email &&
                req.body.password &&
                req.body.repassword &&
                req.body.phone) {
                const emailRegexp =
                    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                let emailCheck = emailRegexp.test(req.body.email)
                if (emailCheck == true) {
                    if (req.body.password == req.body.repassword) {
                        req.body.password = await bcrypt.hash(req.body.password, 10)
                        console.log(req.body.password, 'bcrypt password#');
                        let check = await tutors.findOne({ email: req.body.email })
                        if (!check) {
                            let newData = tutors({
                                name: req.body.name,
                                email: req.body.email,
                                password: req.body.password,
                                phone: req.body.phone
                            })
                            newData.save().then((data) => {
                                let tocken = jwt.sign({
                                    _id: data._id
                                })
                                // apiRes.tocken = tocken
                                console.log(tocken, 'token tutor')
                                res.status(200).json({ data: data, success: true, token: tocken.tocken, error: null })
                                // apiRes.message = 'signup successfully'
                                // res.json(apiRes)
                            })
                        } else {
                            res.status(200).json({ data: null, success: false, error: 'Email allready exist' })
                        }
                    } else {
                        res.status(200).json({ data: null, success: false, error: 'Conform password is incorrect' })
                    }
                } else {
                    res.status(200).json({ data: null, success: false, error: 'Enter the  correct format of Email' })

                }
            } else {
                res.status(200).json({ data: null, success: false, error: 'Fill the required field' })
            }
        } catch (error) {
            console.log(error)
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },

    login: async (req, res) => {
        try {
            console.log(req.body, 'bddyyyyy');
            if (req.body.email && req.body.password) {
                let userr = await tutors.findOne({ email: req.body.email })
                if (userr) {
                    if (userr.access == false) {
                        return res.status(200).json({ data: null, success: false, error: 'Admin blocked this Account' })
                    }
                    let pass = await bcrypt.compare(req.body.password, userr.password)
                    if (pass) {
                        let tocken = jwt.sign({
                            _id: userr._id
                        })
                        res.status(200).json({ data: userr, token: tocken.tocken, success: true, error: null })
                    } else {
                        res.status(200).json({ data: null, success: false, error: 'Invalid Password' })
                    }
                } else {
                    res.status(200).json({ data: null, success: false, error: `There is no account registered with the email ${req.body.email}` })
                }
            } else {
                res.status(200).json({ data: null, success: false, error: 'Fill the required field ' })
            }
        } catch (error) {
            console.log(error)
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    // createClass: (req, res) => {
    //     try {
    //         e
    //     } catch (error) {
    //         console.log(error);
    //     }
    // },
    classPost: (req, res) => {
        try {
            if (req.body?.subject != '' && req.body?.class != ''&& req.body?.chapter != '' && req.body?.time != '' && req.body?.price !=null|undefined) {
                let tu = res.locals.jwtUSER
                 new classes({
                    tutor: tu._id,
                    subject: req.body.subject,
                    class: req.body.class,
                    chapter: req.body.chapter,
                    price: Number(req.body.price),
                    availableTime: req.body.time
                }).save().then((data)=>{
                   
                        res.status(200).json({ data: data, success: true, error: null })
                    
                }).catch((error)=>{
                    console.log(error)
                    res.status(200).json({ data: null, success: false, error: 'Server failure' })
                })
            } else {
                res.status(200).json({ data: null, success: false, error: 'Fill all required field' })
            }
        } catch (error) {
            console.log(error)
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    otpEmail: async (req, res) => {
        try {
            console.log('keeeeeeeeeeerrrryyy');
            var digits = '0123456789'
            let OTP = ''
            for (let i = 0; i < 4; i++) {
                OTP += digits[Math.floor(Math.random() * 10)]
            }
            // Create Nodemailer Transporter
            const transporter = nodemailer.createTransport({
                host: "smtp.office365.com",
                port: 587,
                service: "Outlook",
                auth: {
                    user: process.env.SERVICE_EMAIL,
                    pass: process.env.SERVICE_PASS
                }
            })
            const tu = res.locals.jwtUSER
            const tutor = await tutors.findOne({ _id: tu._id })

            tutor.resetToken = OTP
            const exTime = new Date()
            exTime.setMinutes(exTime.getMinutes() + 1.5);
            tutor.expTime = exTime
            tutor.save()

            let mailOptions = {
                from: process.env.SERVICE_EMAIL,
                to: tutor.email,
                subject: 'Email verification !!!!!',
                html: `
                <p>Your Verification Code :- ${OTP}</p>
              `
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    res.status(401).json({ err: `Internal Server error` })
                    console.log(error);
                } else {

                    console.log('Email sent: ' + info.response);
                    res.status(200).json({ status: true })
                }
            });


        } catch (error) {
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    otpCheck: async (req, res) => {
        try {
            console.log('JJJJJJJJJJJJ')
            const otp = req.body.otp
            const tu = res.locals.jwtUSER

            const tutor = await tutors.findOne({ _id: tu._id, resetToken: otp, expTime: { $gt: Date.now() } })

            if (!tutor || tutor == null) {
                return res.status(200).json({ error: `Otp Verification failed` })
            }

            const updatedTutor = await tutors.findOneAndUpdate({ _id: tu._id }, { $set: { verified: true }, $unset: { resetToken: '', expTime: '' } }, { new: true })

            res.status(200).json({ status: true })

        } catch (error) {
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },

    tutors : async(req,res)=>{
        try {
            const tu = res.locals.jwtUSER
            const tutor = await tutors.findOne({_id:tu._id})
            if(!tutor || tutor == null){
                return res.status(200).json({ error: `tutor is logged out` })
            }else{
                res.status(200).json({ data:tutor })

            }
        } catch (error) {
           res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    classData : async(req,res)=>{
        try {
            let tu = res.locals.jwtUSER
            console.log(tu,'tuuuuuuuu');
            const cls = await classes.find({tutor:tu._id})
            console.log(cls,'clsssss');
            res.status(200).json({ data:cls.length == 0 ? [] : cls })
        } catch (error) {
            console.log(error);
           res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    classDetail : async(req,res)=>{
        try {
            console.log(req.params.id,'iiiiddd body');
            const clsId = req.params.id
            const cls = await classes.findOne({_id:clsId}).populate('review.student')
            return res.status(200).json({data:cls})
        } catch (error) {
            console.log(error)
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    editClass : async(req,res)=>{
        try {
            console.log(req.body,'edit class body');
            console.log(req.body.subject, req.body.class,req.body.chapter, req.body.availableTime ,req.body.price,'edit body details');
            if(req.body.subject !=='' && req.body.class !==''&& req.body.chapter !=='' && req.body.availableTime !=='' && req.body.price !==null){
                console.log(req.body.subject, req.body.class,req.body.chapter, req.body.availableTime ,req.body.price,'edit body details');
                classes.updateOne({_id:req.body._id},{$set:{
                    subject:req.body.subject,
                    class:req.body.class,
                    chapter:req.body.chapter,
                    availableTime:req.body.time,
                    price:req.body.price
                }}).then((data)=>{
                    res.status(200).json({data:data,success:true})
                })
            }else{
                res.status(200).json({data:null,success:false,error:'error'})
            }
        } catch (error) {
            console.log(error)
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    classDataEdit : async(req,res)=>{
        try {
            console.log(req.params.id,'iiiiddd body');
            const clsId = req.params.id
            const cls = await classes.findOne({_id:clsId})
            return res.status(200).json({data:cls})
        } catch (error) {
            console.log(error)
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    classDelete :async(req,res)=>{
        try {
            const clsId = req.params.id
            console.log(clsId,'delete cls id');
           await classes.deleteOne({_id:clsId})
            return res.status(200).json({data:null,success:true,error:null})
        } catch (error) {
            console.log(error)
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    assignmentAdd:async(req,res)=>{
        try {
            console.log(req.body,'reqbody');
            console.log(req.body.description,'sssss');
            let filePath = req.file.path;
            console.log(filePath,'file path');
            filePath = 'http://localhost:3000'+filePath.substring(6).replace(/\\/g, '/');
            console.log(filePath,'fffffffff');
            const classId = req.params.clsId;

            await classes.findOneAndUpdate({_id:classId},{$push:{assignment:{path:filePath,description:req.body.description,date:new Date()}}})
          
            res.status(200).json({ success:true})
          
        } catch (error) {
          console.log(error)
          res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    assignmentFetch: async(req,res)=>{
        try {
            console.log(req.params,'enterd in assignmentFetch');
            const classId = req.params.id;
            const page = parseInt(req.params.currentpage) || 1;
            let limit = parseInt(req.params.pagesize) || 6;
            console.log(page,'page');
            console.log(limit,'page size');
        
            const startIndex = (page - 1) * limit;
            const a = await classes.findOne({_id:classId})
            const assignmentCount = a.assignment.length;
            
            console.log(assignmentCount,'count');
            const assin = await classes.findById(classId)
             console.log(startIndex,'start',limit)
             if(limit > assignmentCount - startIndex){
                  limit =  assignmentCount - startIndex
             }
             console.log(limit,'changed limiT',startIndex);
              const assignment = assin.assignment.splice(startIndex,limit)
              console.log(assignment.length,'assignment ------');
            if (!assignment) {
              return res.status(200).json({ success: false, error: 'assignment not found' });
            }
        
            res.status(200).json({
              data: assignment,
              page,
              totalPages: Math.ceil(assignmentCount / limit),
              totalCount: assignmentCount,
              success: true,
              error: null
            })





            // const classId = req.params.id;
            // const assignment = await classes.findById(classId).select('assignment')
            // console.log(assignment,'assssssssssssssiiigg');
            // res.status(200).json({data:assignment,success:true,error:null}) 
        } catch (error) {
            console.log(error)
          res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    questionAdd:async(req,res)=>{
        try {
            console.log('question entered');
            let filePath = req.file.path;
            console.log(filePath,'file path');
            filePath = 'http://localhost:3000'+filePath.substring(6).replace(/\\/g, '/');
            console.log(filePath,'file paaaaathhhh');
            const classId = req.params.clsId;

            await classes.findOneAndUpdate({_id:classId},{$push:{questionPaper:{path:filePath,description:req.body.description,date:new Date()}}})
          
            res.status(200).json({ success:true})
          
        } catch (error) {
          console.log(error)
          res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    questionFetch: async(req,res)=>{
        try {
            console.log(req.params,'enterd in questionFetch');
            const classId = req.params.id;
            const page = parseInt(req.params.currentpage) || 1;
            let limit = parseInt(req.params.pagesize) || 6;
            console.log(page,'page');
            console.log(limit,'page size');
        
            const startIndex = (page - 1) * limit;
            const qs = await classes.findOne({_id:classId})
            const questionPaperCount = qs.questionPaper.length;
            
            console.log(questionPaperCount,'count');
            const qns = await classes.findById(classId)
             console.log(startIndex,'start',limit)
             if(limit > questionPaperCount - startIndex){
                  limit =  questionPaperCount - startIndex
             }
             console.log(limit,'changed limiT',startIndex);
              const question = qns.questionPaper.splice(startIndex,limit)
              console.log(question.length,'question ------ paper');
            if (!question) {
              return res.status(404).json({ success: false, error: 'Question paper not found' });
            }
        
            res.status(200).json({
              data: question,
              page,
              totalPages: Math.ceil(questionPaperCount / limit),
              totalCount: questionPaperCount,
              success: true,
              error: null
            })
        // try {
        //     const classId = req.params.id;
        //     const question = await classes.findById(classId).select('questionPaper')
        //     console.log(question,'question ------ paper');
        //     res.status(200).json({data:question.questionPaper,success:true,error:null}) 
        } catch (error) {
            console.log(error)
          res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    paginationData : async (req,res)=>{
        try {
            const page = parseInt(req.params.currentpage);
            const pageSize = parseInt(req.params.pagesize);
            console.log(page,'page');
            console.log(pageSize,'page size');
            const skip = (page - 1) * pageSize;
            const totalCount = await classes.countDocuments();
            console.log(totalCount,'totalCount.....');
            const data = await classes.find().skip(skip).limit(pageSize);
            console.log(data,'dataaaaa.....');
            res.status(200).json({ data, totalCount });
        } catch (error) {
            console.log(error);
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    tutorCheck : async (req,res)=>{
        try {
            let tu = res.locals.jwtUSER
            console.log(tu._id,'jwt id kitty');
            const tutor = await tutors.findById({_id:tu._id})
            res.status(200).json({ data:tutor });
        } catch (error) {
            console.log(error);
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    studentInClass : async (req,res)=>{
        try {
            classId = req.params.id;
            const students = await classes.findById(classId).select('students')
            console.log(students,'student list in class');
            res.status(200).json({data:students,success:true,error:null}) 
        } catch (error) {
            console.log(error);
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    videoUploads : async (req,res)=>{
        try {
            console.log(req.body,'video body')
            let filepath = req.file.path
            console.log(filepath,'video file path')
            filepath = 'http://localhost:3000'+filepath.substring(6).replace(/\\/g, '/')
            console.log(filepath,'video file path 2');
            const classId = req.params.clsId

            await classes.findByIdAndUpdate({_id:classId},{$push:{video:{path:filepath,description:req.body.description,date:new Date()}}})

            res.status(200).json({ success:true})

        } catch (error) {
            console.log(error);
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    demoVideoUploads : async (req,res)=>{
        try {
            console.log(req.body,'demo video body')
            let filepath = req.file.path
            console.log(filepath,'demo video file path')
            filepath = 'http://localhost:3000'+filepath.substring(6).replace(/\\/g, '/')
            console.log(filepath,'demo video file path 2');
            const classId = req.params.clsId

            await classes.findByIdAndUpdate({_id:classId},{$push:{video:{path:filepath,description:req.body.description,date:new Date()}}})

            res.status(200).json({ success:true})

        } catch (error) {
            console.log(error);
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    assignmentDelete : async (req,res)=>{
        try {

            const aId = req.params.id;
            const clsId = req.params.clsId;
            await classes.updateOne({_id:clsId},{$pull:{assignment:{_id:aId}}})
            res.status(200).json({ success:true})
        } catch (error) {
            console.log(error);
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    questionDelete : async (req,res)=>{
        try {

            const qId = req.params.id;
            const clsId = req.params.clsId;
            await classes.updateOne({_id:clsId},{$pull:{questionPaper:{_id:qId}}})
            res.status(200).json({ success:true})
        } catch (error) {
            console.log(error);
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    videoDelete : async (req,res)=>{
        try {

            const vId = req.params.id;
            const clsId = req.params.clsId;
            await classes.updateOne({_id:clsId},{$pull:{video:{_id:vId}}})
            console.log('deleted video');
            res.status(200).json({ success:true})
        } catch (error) {
            console.log(error);
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    videoFetch : async (req,res)=>{
        try {
            console.log(req.params,'enterd in videoFetch');
            const classId = req.params.id;
            const page = parseInt(req.params.currentpage) || 1;
            let limit = parseInt(req.params.pagesize) || 6;
            console.log(page,'page');
            console.log(limit,'page size');
        
            const startIndex = (page - 1) * limit;
            const v = await classes.findOne({_id:classId})
            const videoCount = v.video.length;
            
            console.log(videoCount,'count');
            const vd = await classes.findById(classId)
             console.log(startIndex,'start',limit)
             if(limit > videoCount - startIndex){
                  limit =  videoCount - startIndex
             }
             console.log(limit,'changed limiT',startIndex);
              const video = vd.video.splice(startIndex,limit)
              console.log(video.length,'video ------');
            if (!video) {
              return res.status(200).json({ success: false, error: 'video not found' });
            }
        
            res.status(200).json({
              data: video,
              page,
              totalPages: Math.ceil(videoCount / limit),
              totalCount: videoCount,
              success: true,
              error: null
            })



            // const classId = req.params.id
            // const video = await classes.findById(classId).select('video')
            // console.log(video,'---------- video');
            // res.status(200).json({data:video,success:true,error:null})
        } catch (error) {
            console.log(error);
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    }

}