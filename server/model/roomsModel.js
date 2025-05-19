const mongoose = require('mongoose')
const roomSchema = new mongoose.Schema({
    _id: String,
    state: {
      numSession: Number,
      typeSession: String
    },
    listUsers: [String],
    tasks: [{
        name: String,
        userRef: String
    }],
    timeSetting: {
        work: Number,
        shortBreak: Number,
        longBreak: Number
    }

});

const roomsModel = mongoose.model('rooms', roomSchema);
module.exports = {roomsModel}