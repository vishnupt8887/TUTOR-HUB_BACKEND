const tutors = require('../model/tutorSchema')
const bcrypt = require('bcrypt')
const jwt = require('../helpers/jwt')
const nodemailer = require('nodemailer')
const classes = require('../model/classSchema')





module.exports = {
    signup: async (req, res) => {
        try {
             ;
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
                         ;
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
             
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },

    login: async (req, res) => {
        try {
             ;
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
             
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    // createClass: (req, res) => {
    //     try {
    //         e
    //     } catch (error) {
    //          ;
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
                     
                    res.status(200).json({ data: null, success: false, error: 'Server failure' })
                })
            } else {
                res.status(200).json({ data: null, success: false, error: 'Fill all required field' })
            }
        } catch (error) {
             
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    otpEmail: async (req, res) => {
        try {
             ;
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
                     ;
                } else {

                     ;
                    res.status(200).json({ status: true })
                }
            });


        } catch (error) {
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    otpCheck: async (req, res) => {
        try {
             
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
             ;
            const cls = await classes.find({tutor:tu._id})
             ;
            res.status(200).json({ data:cls.length == 0 ? [] : cls })
        } catch (error) {
             ;
           res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    classDetail : async(req,res)=>{
        try {
             ;
            const clsId = req.params.id
            const cls = await classes.findOne({_id:clsId}).populate('review.student')
            return res.status(200).json({data:cls})
        } catch (error) {
             
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    editClass : async(req,res)=>{
        try {
             ;
             ;
            if(req.body.subject !=='' && req.body.class !==''&& req.body.chapter !=='' && req.body.availableTime !=='' && req.body.price !==null){
                 ;
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
             
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    classDataEdit : async(req,res)=>{
        try {
             ;
            const clsId = req.params.id
            const cls = await classes.findOne({_id:clsId})
            return res.status(200).json({data:cls})
        } catch (error) {
             
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    classDelete :async(req,res)=>{
        try {
            const clsId = req.params.id
             ;
           await classes.deleteOne({_id:clsId})
            return res.status(200).json({data:null,success:true,error:null})
        } catch (error) {
             
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    assignmentAdd:async(req,res)=>{
        try {
            let filePath = req.file.path;
             
            filePath = 'https://tutors-hub-api.timezonewatch.store'+(filePath.substring(6).replace(/\\/g, '/'));
             
            const classId = req.params.clsId;

            await classes.findOneAndUpdate({_id:classId},{$push:{assignment:{path:filePath,description:req.body.description,date:new Date()}}})
          
            res.status(200).json({ success:true})
          
        } catch (error) {
           
          res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    assignmentFetch: async(req,res)=>{
        try {
             ;
            const classId = req.params.id;
            const page = parseInt(req.params.currentpage) || 1;
            let limit = parseInt(req.params.pagesize) || 6;
             ;
             ;
        
            const startIndex = (page - 1) * limit;
            const a = await classes.findOne({_id:classId})
            const assignmentCount = a.assignment.length;
            
             ;
            const assin = await classes.findById(classId)
              
             if(limit > assignmentCount - startIndex){
                  limit =  assignmentCount - startIndex
             }
              ;
              const assignment = assin.assignment.splice(startIndex,limit)
               ;
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
            //  ;
            // res.status(200).json({data:assignment,success:true,error:null}) 
        } catch (error) {
             
          res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    questionAdd:async(req,res)=>{
        try {
             ;
            let filePath = req.file.path;
             ;
            filePath = 'https://tutors-hub-api.timezonewatch.store'+filePath.substring(6).replace(/\\/g, '/');
             ;
            const classId = req.params.clsId;

            await classes.findOneAndUpdate({_id:classId},{$push:{questionPaper:{path:filePath,description:req.body.description,date:new Date()}}})
          
            res.status(200).json({ success:true})
          
        } catch (error) {
           
          res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    questionFetch: async(req,res)=>{
        try {
             ;
            const classId = req.params.id;
            const page = parseInt(req.params.currentpage) || 1;
            let limit = parseInt(req.params.pagesize) || 6;
             ;
             ;
        
            const startIndex = (page - 1) * limit;
            const qs = await classes.findOne({_id:classId})
            const questionPaperCount = qs.questionPaper.length;
            
             ;
            const qns = await classes.findById(classId)
              
             if(limit > questionPaperCount - startIndex){
                  limit =  questionPaperCount - startIndex
             }
              ;
              const question = qns.questionPaper.splice(startIndex,limit)
               ;
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
        //      ;
        //     res.status(200).json({data:question.questionPaper,success:true,error:null}) 
        } catch (error) {
             
          res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    paginationData : async (req,res)=>{
        try {
            const page = parseInt(req.params.currentpage);
            const pageSize = parseInt(req.params.pagesize);
             ;
             ;
            const skip = (page - 1) * pageSize;
            const totalCount = await classes.countDocuments();
             ;
            const data = await classes.find().skip(skip).limit(pageSize);
             ;
            res.status(200).json({ data, totalCount });
        } catch (error) {
             ;
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    tutorCheck : async (req,res)=>{
        try {
            let tu = res.locals.jwtUSER
             ;
            const tutor = await tutors.findById({_id:tu._id})
            res.status(200).json({ data:tutor });
        } catch (error) {
             ;
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    studentInClass : async (req,res)=>{
        try {
             ;
            const classId = req.params.id;
            const page = parseInt(req.params.currentpage) || 1;
            let limit = parseInt(req.params.pagesize) || 6;
             ;
             ;
        
            const startIndex = (page - 1) * limit;
            const st = await classes.findOne({_id:classId})
            const studentsCount = st.students.length;
            
             ;
            const s = await classes.findById(classId).populate('students')
              
             if(limit > studentsCount - startIndex){
                  limit =  studentsCount - startIndex
             }
              ;
              const students = s.students.splice(startIndex,limit)
               ;
            if (!students) {
              return res.status(200).json({ success: false, error: 'students not found' });
            }
        
            res.status(200).json({
              data: students,
              page,
              totalPages: Math.ceil(studentsCount / limit),
              totalCount: studentsCount,
              success: true,
              error: null
            })
            // classId = req.params.id;
            // const students = await classes.findById(classId).select('students')
            //  ;
            // res.status(200).json({data:students,success:true,error:null}) 
        } catch (error) {
             ;
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    videoUploads : async (req,res)=>{
        try {
             
            let filepath = req.file.path
             
            filepath = 'https://tutors-hub-api.timezonewatch.store'+filepath.substring(6).replace(/\\/g, '/')
             ;
            const classId = req.params.clsId

            await classes.findByIdAndUpdate({_id:classId},{$push:{video:{path:filepath,description:req.body.description,date:new Date()}}})

            res.status(200).json({ success:true})

        } catch (error) {
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    demoVideoUploads : async (req,res)=>{
        try {
             
            let filepath = req.file.path
             
            filepath = 'https://tutors-hub-api.timezonewatch.store'+filepath.substring(6).replace(/\\/g, '/')
             ;
            const classId = req.params.clsId

            await classes.findByIdAndUpdate({_id:classId},{$push:{video:{path:filepath,description:req.body.description,date:new Date()}}})

            res.status(200).json({ success:true})

        } catch (error) {
             ;
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
             ;
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
             ;
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    videoDelete : async (req,res)=>{
        try {

            const vId = req.params.id;
            const clsId = req.params.clsId;
            await classes.updateOne({_id:clsId},{$pull:{video:{_id:vId}}})
             ;
            res.status(200).json({ success:true})
        } catch (error) {
             ;
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    videoFetch : async (req,res)=>{
        try {
             ;
            const classId = req.params.id;
            const page = parseInt(req.params.currentpage) || 1;
            let limit = parseInt(req.params.pagesize) || 6;
             ;
             ;
        
            const startIndex = (page - 1) * limit;
            const v = await classes.findOne({_id:classId})
            const videoCount = v.video.length;
            
             ;
            const vd = await classes.findById(classId)
              
             if(limit > videoCount - startIndex){
                  limit =  videoCount - startIndex
             }
              ;
              const video = vd.video.splice(startIndex,limit)
               ;
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
            //  ;
            // res.status(200).json({data:video,success:true,error:null})
        } catch (error) {
             ;
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },

  

}