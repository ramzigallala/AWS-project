const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema({
    _id: String, //email
    name: String,
    surname: String,
    password: String
});

const usersModel = mongoose.model('users', UserSchema);
module.exports = {usersModel}