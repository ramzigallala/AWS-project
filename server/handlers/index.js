const manageRoom = require('./roomHandler');
const manageTimer = require('./timerHandler');
const manageTasks = require('./tasksHandler');
const manageUser = require('./userHandler');

/**
 * Initializes and sets up all socket event handlers for the application.
 *
 * @param {import('socket.io').Socket} socket - The socket instance for the connected client.
 * @param {Object} socketService - An object providing a state across socket handlers.
 */
module.exports = function setupHandlers(socket, socketService) {
    manageRoom(socket, socketService);
    manageTimer(socket, socketService);
    manageTasks(socket, socketService);
    manageUser(socket, socketService);
};
