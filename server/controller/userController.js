const { usersModel } = require('../model/UsersModel');
const bcrypt = require('bcryptjs');
/**
 * Registers a new user in the system if the email does not already exist.
 * Hashes the password before storing it.
 *
 * @param {Object} userToAdd - The user data to add.
 * @returns {Promise<Object>} - An object with the success status and user data or error message.
 * @throws {Error} - Throws if there's an error during user creation.
 */

exports.addUser = async userToAdd => {
    try {
        if(await this.existEmail(userToAdd.email)){
            return {success: false, status: "Utente già presente"};
        }else{
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(userToAdd.password, salt);

            const user = new usersModel({
                _id: userToAdd.email,
                name: userToAdd.name,
                surname: userToAdd.surname,
                password: hashed
            });

            const newUser = await user.save();
            return {success: true, user: newUser};
        }
    } catch (err) {
        throw new Error(`Error while adding user: ${err.message}`);
    }
}
/**
 * Checks if a user with the given email already exists.
 *
 * @param {string} email - The email to check.
 * @returns {Promise<boolean>} - True if the user exists, false otherwise.
 * @throws {Error} - Throws if there's an error during the check.
 */

exports.existEmail = async (email) => {
    try {
        const user = await usersModel.findById(email);
        return user !== null;
    } catch (err) {
        throw new Error(`Error while verifying the email: ${err.message}`);
    }
}
/**
 * Authenticates a user by comparing the provided password with the stored hash.
 *
 * @param {string} email - The user's email.
 * @param {string} password - The plaintext password to verify.
 * @returns {Promise<Object|boolean>} - The user's basic info if authenticated, or false if not.
 * @throws {Error} - Throws if there's an error during authentication.
 */

exports.authenticateUser = async (email, password) => {
    try {
        const user = await usersModel.findById(email);
        if (!user) return false;

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return false;

        return {name:user.name, surname:user.surname};
    } catch (error) {
        throw new Error(`Error while verifying the user: ${err.message}`);
    }
}