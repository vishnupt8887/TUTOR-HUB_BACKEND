const jwt = require('jsonwebtoken')

module.exports = {
    sign : (userData)=>{
      let jwtSecret = process.env.JWT_TOKEN 
      let tocken = jwt.sign(userData,jwtSecret,{expiresIn:process.env.SESS_TIMOUT})
      let decoded = jwt.decode(tocken)
      return{tocken,exp:decoded.exp*1000} 
    },
    verify:(req,res,next)=>{
      let apiRes = {
          message:'Login required!',
          authenticated:false,
          data:{}
      }
       ;
      let jwtSecret = process.env.JWT_TOKEN;
      const authHeader = req.headers.authorization;
   
      const token = authHeader && authHeader.split(' ')[1];
        ;
      if (!token) {
          apiRes.message = 'Missing authorization header'
        return res.status(200).json(apiRes);
      }
    
      try {
        const decoded = jwt.verify(token, jwtSecret);
        
        res.locals.jwtUSER = decoded;
        
        next()
      } catch (err) {
         ;
          apiRes.message = 'Invalid token'
        res.status(200).json(apiRes);
      }
  }
}