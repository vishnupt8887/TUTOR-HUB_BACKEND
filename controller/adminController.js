const jwt = require('../helpers/jwt')
const studentdModel = require('../model/studentSchema')
const tutorModel = require('../model/tutorSchema')

module.exports = {
    adminlogin: (req, res) => {
        try {
            if (req.body.password && req.body.email) {
                const emailRegexp =
                    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                let emailcheck = emailRegexp.test(req.body.email);
                if (emailcheck == true) {
                    if (req.body.password == process.env.AD_PASSWORD && req.body.email == process.env.AD_EMAIL) {

                        let token = jwt.sign({
                            email: process.env.AD_EMAIL,
                            password: process.env.AD_PASSWORD,
                        })
                        res.status(200).json({ data: null, success: true, token: token.tocken, error: null })
                    } else {
                        res.status(200).json({ data: null, success: false, error: 'Enter the correct password' })
                    }
                } else {
                    res.status(200).json({ data: null, success: false, error: 'Enter the correct Email' })
                }
            } else {
                res.status(200).json({ data: null, success: false, error: 'Enter the details' })
            }
        } catch (error) {
             
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    studentLt: (req, res, next) => {
        try {

            studentdModel.find().then((data) => {
                 ;
                res.json(data)
            })
        } catch (error) {
             ;
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    tutorLt: (req, res) => {
        try {
            tutorModel.find().then((data) => {
                 ;
                res.json(data)
            })
        } catch (error) {
             ;
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },
    tutorBlock: async (req, res) => {
        try {
            if (req.body) {
                 ;
                let tutorcheck = await tutorModel.findOne({ _id: req.body.id.id })
                if (tutorcheck) {
                     ;
                    if (tutorcheck.access == true) {
                         ;

                        tutorModel.findOneAndUpdate({ _id: req.body.id.id }, { $set: { access: false } }, { upsert: true }).then((data) => {
                            res.json(data)
                        })
                    } else {
                        tutorModel.findOneAndUpdate({ _id: req.body.id.id }, { $set: { access: true } }, { upsert: true }).then((data) => {
                            res.json(data)
                        })
                    }
                }
            }
        } catch (error) {
             ;
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },

    studentBlock: async (req, res) => {
        try {
            let user = res.locals.jwtUSER
            if (req.body) {
                 ;
                let studentCheck = await studentdModel.findOne({ _id: req.body.id.id })
                if (studentCheck) {
                     ;
                    if (studentCheck.access == true) {
                         ;

                        studentdModel.findOneAndUpdate({ _id: req.body.id.id }, { $set: { access: false } }, { upsert: true }).then((data) => {
                            res.json(data)
                        })
                    } else {
                        studentdModel.findOneAndUpdate({ _id: req.body.id.id }, { $set: { access: true } }, { upsert: true }).then((data) => {
                            res.json(data)
                        })
                    }
                }
            }
        } catch (error) {
             ;
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },

    searchTutor: async (req, res, next) => {
        try {
             ;
            let tutorSearch = new RegExp("^" + req.body.search + ".*", "i");
            let tutorDetails = await userModel.aggregate([
                {
                    $match: {
                        $or: [
                            { name: tutorSearch },
                            { email: tutorSearch },
                            { phone: Number(req.body.search) }
                        ],
                    },
                },
            ]);
             ;
            res.json(tutorDetails)
        } catch (error) {
             ;
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    },

    searchStudent: async (req, res, next) => {
        try {
             ;
            let studentSearch = new RegExp("^" + req.body.search + ".*", "i");
            let studentDetails = await userModel.aggregate([
                {
                    $match: {
                        $or: [
                            { name: studentSearch},
                            { email: studentSearch},
                            { phone: Number(req.body.search) }
                        ],
                    },
                },
            ]);
             ;
            res.json(studentDetails)
        } catch (error) {
             ;
            res.status(200).json({ data: null, success: false, error: 'Server failure' })
        }
    }

}