const mongoose = require('mongoose')
const tasksSchema = new mongoose.Schema({
    _id: String,
    tasksDone:[{
        name: String,
        room: String
    }]
});

const tasksModel = mongoose.model('tasks', tasksSchema);
module.exports = {tasksModel}