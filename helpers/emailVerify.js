const tutorModel = require('../model/tutorSchema')

module.export = verifiedUserCheck  = async(req,res,next)=>{
    let tu = res.locals.jwtUSER
    let tutor = await tutorModel.findOne({_id:tu._id, verified:true})
    if(!tutor){
        res.status(200).json({data:null,error:'Tutor not verified email '})
    }else{
        next()
    }
}