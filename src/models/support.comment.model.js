
var mongoose = require('mongoose');
var validator = require('validator');
const { SUPPORT_STATUS } = require('../config/constant');
var Schema = mongoose.Schema;

var supportCommentSchema = new Schema({
    ticketId: {
        type: Schema.Types.ObjectId, required: true, ref: 'supporttickets', // commented user id
    },
    userId: {
        type: Schema.Types.ObjectId, required: true, // commented user id
    },
    description: {
        type: String,
        index: true
    },
    images: {
        type: Array
    }
}, {
        timestamps: true,
        toObject: { getters: true },
        toJSON: { getters: true },
    }
);



const supportComment = mongoose.model('SupportComment', supportCommentSchema);

module.exports = supportComment;