const {tasksModel} = require('../model/tasksModel');
/**
 * Adds a task to a user's completed tasks. If the user doesn't exist, a new record is created.
 * @param {Object} taskData - The task data to be added.
 * @returns {Promise<boolean>} - Returns true if the operation was successful.
 * @throws {Error} - Throws an error if the operation fails.
 */
exports.addTask = async (taskData) => {
    try {
        const existingTask = await tasksModel.findById(taskData.userRef);
        if (existingTask) {
            existingTask.tasksDone.push({ name:taskData.name, room: taskData.room });
            await existingTask.save();
            return true;
        } else {
            const newTask = await tasksModel.create({
                _id: taskData.userRef,
                tasksDone: [{ name:taskData.name, room: taskData.room }],
            });
            return true;
        }
    } catch (error) {
        console.error('Error when adding the task:', error);
    }
};
/**
 * Retrieves the list of completed tasks for a given user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object|null>} - The user document with completed tasks, or null if not found.
 */
exports.takesTasksDone = async (userId) => {
    return tasksModel.findById(userId);
}