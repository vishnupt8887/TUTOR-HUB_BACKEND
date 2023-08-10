const mongoose = require('mongoose')

const classSchema = new mongoose.Schema({
    tutor: {
        type: String,
        ref: 'Tutor'
    },
    subject: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    availableTime: {
        type: String,
        required: true
    },
    chapter: {
        type: String,
        required: true
    },
    students: {
        type: [{
            type: String,
            ref: 'Student'
        }],
        default: []
    },
    video: {
        type: [{
            path: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            date: {
                type: Date
            }
        }],
        default: []
    },
    demoVideo: {
        type: [{
            path: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            date: {
                type: Date
            }
        }],
        default: []
    },
    questionPaper: {
        type: [{
            path: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            date: {
                type: Date
            }
        }],
        default: []
    },
    assignment: {
        type: [{
            path: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            date: {
                type: Date
            }
        }],
        default: []
    },
    review: {
        type: [{
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student'
            },
            star: {
                type: Number,
                required: true
            },
            Comment: {
                type: String,
                required: true
            },
            date: {
                type: Date
            }
        }],
        default: []
    },
    avgRating: {
        type: Number,
        default: 0
    },
    access: {
        type: Boolean,
        default: true
    }
})


module.exports = mongoose.model('Class', classSchema)