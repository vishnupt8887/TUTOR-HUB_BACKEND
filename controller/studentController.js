const students = require('../model/studentSchema')
const classModel = require('../model/classSchema')
const bcrypt = require('bcrypt')
const jwt = require('../helpers/jwt')
const paymentHelper = require('../helpers/verify_payment')
const Payment = require('../model/paymentSchema')
module.exports = {
    signup : async(req,res)=>{
        try {
             ;
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
                         ;
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
             
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },

    login : async(req,res)=>{
        try {
             ;
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
                     ;
                } else {
                   
                     ;
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
             ;
           res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    classDetail : async(req,res)=>{
        try {
             
             
            const clsId = req.body.id
            const cls = await classModel.findOne({_id:clsId}).populate('tutor').populate('review.student')
            if(!cls || cls == null){
                return res.status(200).json({ error: `student is logged out` })
            }else{
                res.status(200).json({ data:cls })

            }
        } catch (error) {
             ;
           res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    classIn : async (req,res)=>{
        try {
            const studentId = res.locals.jwtUSER._id
            const classId = req.params.id
           await classModel.findByIdAndUpdate({_id:classId},{$addToSet:{students:studentId}})
        } catch (error) {
             ;
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
            const totalCount = await classModel.countDocuments();
             ;
            const data = await classModel.find().skip(skip).limit(pageSize);
             ;
            res.status(200).json({ data, totalCount });
        } catch (error) {
             ;
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    ratingData : async (req,res)=>{
        try {
             ;
            if(req.body?.star != '' && req.body?.comment != ''){
               ;
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
             ;
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
            const qs = await classModel.findOne({_id:classId})
            const questionPaperCount = qs.questionPaper.length;
            
             ;
            const qns = await classModel.findById(classId)
              
             if(limit > questionPaperCount - startIndex){
                  limit =  questionPaperCount - startIndex
             }
              ;
              const question = qns.questionPaper.splice(startIndex,limit)
               ;
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
            const as = await classModel.findOne({_id:classId})
            const assignmentCount = as.assignment.length;
            
             ;
            const a = await classModel.findById(classId)
              
             if(limit > assignmentCount - startIndex){
                  limit =  assignmentCount - startIndex
             }
              ;
              const assignment = a.assignment.splice(startIndex,limit)
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
        } catch (error) {
             
          res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    videoFetch: async(req,res)=>{
        try {
             ;
            const classId = req.params.id;
            const page = parseInt(req.params.currentpage) || 1;
            let limit = parseInt(req.params.pagesize) || 6;
             ;
             ;
        
            const startIndex = (page - 1) * limit;
            const as = await classModel.findOne({_id:classId})
            const videoCount = as.video.length;
            
             ;
            const a = await classModel.findById(classId)
              
             if(limit > videoCount - startIndex){
                  limit =  videoCount - startIndex
             }
              ;
              const video = a.video.splice(startIndex,limit)
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
        } catch (error) {
             
          res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    studentCheck : async (req,res)=>{
        try {
            let st = res.locals.jwtUSER
             ;
            const student = await students.findById({_id:st._id})
            res.status(200).json({ data:student});
        } catch (error) {
             ;
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },


    paymentStart : async(req,res) => {
        const crypto = require('crypto')
        const Razorpay = require('razorpay')
        const {amount} = req.body;
        const instance = new Razorpay({
           key_id : 'rzp_test_ljYqmwHMTBq3V8',
            key_secret : 'yixVolFFESVi2d0CV74jCko3'
          })
      
          const options = {
            amount: parseInt(amount)*100,
            currency: "INR",
            receipt: crypto.randomBytes(10).toString('hex')
          }

          instance.orders.create(options, (error, order) => {
            if (error) {
               ;
              return res.status(500).json({ message: 'Something gone wrong' })
            }
            res.status(200).json({ data: order })
          })
      
      
    },

    verifyPayment : async (req,res) => {
        const {studentId,classId,amount} = req.body.data;
         paymentHelper(req.body).then(async()=> {
            const payment = new Payment({
                classId,
                studentId,
                amount,
                paymentStatus:'success'
            })
             await payment.save()
             res.status(200).json({data:payment,status:'success'})
         }).catch((e)=> {
             ;
            res.status(200).json({status:'failed'})
         })
    },

    studentClass : async (req,res) =>{
        try {
             ;
            const sId = res.locals.jwtUSER._id
            // const classId = req.params.id;
            const page = parseInt(req.params.currentpage) || 1;
            let limit = parseInt(req.params.pagesize) || 6;
             ;
             ;
        
            const startIndex = (page - 1) * limit;
            const c = await classModel.find({students:sId}).populate('tutor')
            const classCount = c.length
            
             
              
             if(limit > classCount - startIndex){
                  limit =  classCount - startIndex
             }
              ;
              const cls = c.splice(startIndex,limit)
               ;
            if (!cls) {
              return res.status(200).json({ success: false, error: 'Question paper not found' });
            }
        
            res.status(200).json({
              data: cls,
              page,
              totalPages: Math.ceil(classCount / limit),
              totalCount: classCount,
              success: true,
              error: null
            })
            // const sId = res.locals.jwtUSER._id
            // const cls = await classModel.find({students:sId})
            // res.status(200).json({data:cls,success: true})
        } catch (error) {
             ;
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    }









    // reviewSubmit : async (req,res)=>{
    //     try {
    //          ;
    //         const classId = req.body.id
    //         await classModel.findByIdAndUpdate({_id:classId},{$addToSet:{review}})
    //     } catch (error) {
    //          ;
    //         res.status(200).json({ data: null, success: false, error: 'Server failure' })
    //     }
    // }
}













