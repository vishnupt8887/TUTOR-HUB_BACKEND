const multer = require('multer');
const path = require('path')

        const storage = multer.diskStorage({
            destination: './public/pdf/',
            filename: function (req, file, callback) {
                callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
            }
        })

   

        function checkFileType(file, callback) {
            const filetypes = /pdf/; // Allowed file extensions
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = filetypes.test(file.mimetype);
            console.log(file.originalname, "filename#");
            if (mimetype && extname) {
                return callback(null, true);
            } else {
                return callback('Error: Images Only!');
            }
        }
         // Initialize upload
       const upload  = multer({
            storage: storage,
            limits: { fileSize: 100000000000 }, // 10MB
            fileFilter: function (req, file, callback) {
                checkFileType(file, callback);
            }
        })// 'PDF' is the name attribute of the input file element in the form


        // video storage
        const videoStorage = multer.diskStorage({
            destination: './public/video/', // Destination to store video 
            filename: (req, file, cb) => {
                cb(null, file.fieldname + '_' + Date.now() 
                 + path.extname(file.originalname))
            }
       });

       // video upload
       const videoUpload = multer({
        storage: videoStorage,
        limits: {
        fileSize: 1000000000 // 1,000,000,000 Bytes = 1 GB
        },
        fileFilter(req, file, cb) {
          // upload only mp4 and mkv format
          if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) { 
             return cb(new Error('Please upload a video'))
          }
          cb(undefined, true)
       }
   })

   module.exports = {
   upload,
   videoUpload
   }
