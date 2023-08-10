const students = require('../model/studentSchema')
const classModel = require('../model/classSchema')
const bcrypt = require('bcrypt')
const jwt = require('../helpers/jwt')

module.exports = {
    signup : async(req,res)=>{
        try {
            console.log(req.body,'bodyyyy');
            // let apiRes = {}
            if(req.body.name &&
               req.body.email &&
               req.body.password &&
               req.body.repassword &&
               req.body.phone ){
                const emailRegexp = 
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                let emailCheck = emailRegexp.test(req.body.email)
                if(emailCheck == true){
                    if(req.body.password == req.body.repassword){
                        req.body.password = await bcrypt.hash(req.body.password, 10)
                        console.log(req.body.password,'bcrypt password#');
                        let check = await students.findOne({email:req.body.email})
                        if(!check){
                            let newData = students({
                                name : req.body.name,
                                email : req.body.email,
                                password : req.body.password,
                                phone : req.body.phone
                            })
                            newData.save().then((data)=>{
                                let tocken = jwt.sign({
                                    _id : data._id
                                })
                               
                                // apiRes.tocken = tocken
                                res.status(200).json({data:data,success:true,token:tocken.tocken,error:null})
                                // apiRes.message = 'signup successfully'
                                // res.json(apiRes)
                            })
                        }else{
                            res.status(200).json({data:null,success:false,error:'Email allready exist'})
                        }
                    }else{
                        res.status(200).json({data:null,success:false,error:'Conform password is incorrect'})
                    }
                }else{
                    res.status(200).json({data:null,success:false,error:'Enter the  correct format of Email'})
                    
                }
               }else{
                res.status(200).json({data:null,success:false,error:'Fill the required field'})
               }
        } catch (error) {
            console.log(error)
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },

    login : async(req,res)=>{
        try {
            console.log(req.body,'bddyyyyy');
            if(req.body.email && req.body.password){
                let userr = await students.findOne({email:req.body.email})
                if(userr){
                    if(userr.access==false){
                        return res.status(200).json({data:null,success:false,error:'Admin blocked this Account'})
                    }
                    let pass = await bcrypt.compare(req.body.password,userr.password)
                    if(pass){
                        let tocken = jwt.sign({
                            _id : userr._id
                        })
                        res.status(200).json({data:userr,token:tocken.tocken,success:true,error:null})
                    }else{
                        res.status(200).json({data:null,success:false,error:'Invalid Password'})
                    }
                }else{
                    res.status(200).json({data:null,success:false,error:`There is no account registered with the email ${req.body.email}`})
                }
            }else{
                res.status(200).json({data:null,success:false,error:'Fill the required field '})
            }
        } catch (error) {
            console.log(error)
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    otpEmail: (req,res) =>{
        try {
            var digits = '0123456789'
            let OTP = ''
            for (let i = 0; i < 4; i++){
                OTP += digits[Math.floor(Math.random() * 10)]
            }

            const st = res.locals.jwtUSER
            const student = students.findOne({_id:tu._id})

            student.resetToken = OTP
            const exTime = new Date()
            exTime.setMinutes(exTime.getMinutes() + 1.5);
            student.expTime = exTime
            student.save()
    
            let mailOptions = {
                from: process.env.SERVICE_EMAIL,
                to: student.email,
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
                    res.status(200).json({status:true})
                }
            });


        } catch (error) {
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    classData : async(req,res)=>{
        try {
            const cls = await classModel.find()
            if(!cls || cls == null){
                return res.status(200).json({ error: `student is logged out` })
            }else{
                res.status(200).json({ data:cls })

            }
        } catch (error) {
            console.log(error);
           res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    classDetail : async(req,res)=>{
        try {
            console.log(req.body,'bdyyyy')
            console.log(req.body.id,'iidd bdyyy')
            const clsId = req.body.id
            const cls = await classModel.findOne({_id:clsId}).populate('tutor').populate('review.student')
            if(!cls || cls == null){
                return res.status(200).json({ error: `student is logged out` })
            }else{
                res.status(200).json({ data:cls })

            }
        } catch (error) {
            console.log(error);
           res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    classIn : (req,res)=>{
        try {
            const studentId = res.locals.jwtUSER._id
            const classId = req.params.id
            classModel.findByIdAndUpdate({_id:classId},{$addToSet:{students:studentId}})
        } catch (error) {
            console.log(error);
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    paginationData : async (req,res)=>{
        try {
            const page = parseInt(req.params.currentpage);
            const pageSize = parseInt(req.params.pagesize);
            console.log(page,'pageeeeeee');
            console.log(pageSize,'page sizeeeeee');
            const skip = (page - 1) * pageSize;
            const totalCount = await classModel.countDocuments();
            console.log(totalCount,'totalCount.....');
            const data = await classModel.find().skip(skip).limit(pageSize);
            console.log(data,'dataaaaa.....');
            res.status(200).json({ data, totalCount });
        } catch (error) {
            console.log(error);
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    ratingData : async (req,res)=>{
        try {
            console.log(req.body,'review body');
            if(req.body?.star != '' && req.body?.comment != ''){
              console.log(req.body,'review body');
              const studentId = res.locals.jwtUSER._id
              const classId = req.body._id
              const star = req.body.star
              const comment = req.body.comment
              const allready = await classModel.findOne({_id:classId,'review.student': studentId})
              if(allready){
                await classModel.findByIdAndUpdate({_id:classId},{$pull:{review:{student:studentId}}})
              }
              
            const srating = await classModel.findOneAndUpdate({_id:classId},{$push:{review:{student:studentId,star:star,Comment:comment,date:new Date()}}},{new:true})
                let avg = srating.review.reduce((acc,curr)=>{
                    return acc += curr.star
                },0)
                srating.avgRating = Math.floor( avg / srating.review.length)
                await srating.save()
            res.status(200).json({data:srating, success: true})
            }else{
                res.status(200).json({ data: null, success: false, error: 'All field is required' })
            }
        } catch (error) {
            console.log(error);
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
            const qs = await classModel.findOne({_id:classId})
            const questionPaperCount = qs.questionPaper.length;
            
            console.log(questionPaperCount,'count');
            const qns = await classModel.findById(classId)
             console.log(startIndex,'start',limit)
             if(limit > questionPaperCount - startIndex){
                  limit =  questionPaperCount - startIndex
             }
             console.log(limit,'changed limir',startIndex);
              const question = qns.questionPaper.splice(startIndex,limit)
              console.log(question.length,'question ------ paper');
            if (!question) {
              return res.status(200).json({ success: false, error: 'Question paper not found' });
            }
        
            res.status(200).json({
              data: question,
              page,
              totalPages: Math.ceil(questionPaperCount / limit),
              totalCount: questionPaperCount,
              success: true,
              error: null
            })
        } catch (error) {
            console.log(error)
          res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },

    assignmentFetch: async(req,res)=>{
        try {
            console.log(req.params,'enterd in videoFetch');
            const classId = req.params.id;
            const page = parseInt(req.params.currentpage) || 1;
            let limit = parseInt(req.params.pagesize) || 6;
            console.log(page,'page');
            console.log(limit,'page size');
        
            const startIndex = (page - 1) * limit;
            const as = await classModel.findOne({_id:classId})
            const assignmentCount = as.assignment.length;
            
            console.log(assignmentCount,'count');
            const a = await classModel.findById(classId)
             console.log(startIndex,'start',limit)
             if(limit > assignmentCount - startIndex){
                  limit =  assignmentCount - startIndex
             }
             console.log(limit,'changed limir',startIndex);
              const assignment = a.assignment.splice(startIndex,limit)
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
        } catch (error) {
            console.log(error)
          res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    videoFetch: async(req,res)=>{
        try {
            console.log(req.params,'enterd in videoFetch');
            const classId = req.params.id;
            const page = parseInt(req.params.currentpage) || 1;
            let limit = parseInt(req.params.pagesize) || 6;
            console.log(page,'page');
            console.log(limit,'page size');
        
            const startIndex = (page - 1) * limit;
            const as = await classModel.findOne({_id:classId})
            const videoCount = as.video.length;
            
            console.log(videoCount,'count');
            const a = await classModel.findById(classId)
             console.log(startIndex,'start',limit)
             if(limit > videoCount - startIndex){
                  limit =  videoCount - startIndex
             }
             console.log(limit,'changed limit',startIndex);
              const video = a.video.splice(startIndex,limit)
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
        } catch (error) {
            console.log(error)
          res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    studentCheck : async (req,res)=>{
        try {
            let st = res.locals.jwtUSER
            console.log(st._id,'jwt st id kitty');
            const student = await students.findById({_id:st._id})
            res.status(200).json({ data:student});
        } catch (error) {
            console.log(error);
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    // reviewSubmit : async (req,res)=>{
    //     try {
    //         console.log(req.body,'review body');
    //         const classId = req.body.id
    //         await classModel.findByIdAndUpdate({_id:classId},{$addToSet:{review}})
    //     } catch (error) {
    //         console.log(error);
    //         res.status(200).json({ data: null, success: false, error: 'Server failure' })
    //     }
    // }
}













// login

            // const email = req.body.email
            // const password = req.body.password
            // if(email && password){
            //     const stud = await students.findOne({email:email})
            //     console.log(stud,'useerrr');
            //     console.log(password,'passsss');
            // const pass = await bcrypt.compare(password,stud.password)
            // res.status(200).json({data:null,success:false,error:'user not registered'})
            // }



            
                    // apiRes.tocken = tocken
                    // console.log(tocken,'tocken#')
                    // apiRes.user = userr
                    // console.log(userr,'user#')
                    // apiRes.message = 'Login Successfull'
                    // res.json(apiRes)



//signup
                    
        //     let {name,email,password,phone} = req.body
        //     password = await bcrypt.hash(password,10)
        //     const student = new students({
        //         name,
        //         email,
        //         password,
        //         phone
        //     })
        //    student.save().then((studentDoc)=>{
        //              console.log('response');
        //         res.status(200).json({data:studentDoc,success:true,error:null})
        //     })