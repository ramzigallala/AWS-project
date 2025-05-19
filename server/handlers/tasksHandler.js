const controllerRoom = require('../controller/roomController');
const controllerTask = require('../controller/taskController');
/**
 * Handles socket events related to task management within rooms.
 *
 * @param {import('socket.io').Socket} socket - The socket instance representing the connected client.
 * @param {Object} socketService - A shared service object.
 *
 * Events Handled:
 * - "addTask": Adds a task for a specific user in a room.
 * - "deleteTask": Deletes a task from a specific room and notify the client.
 */
module.exports = function taskHandler(socket, socketService) {
    const clients = socketService.clients;
    const queueByRoom = socketService.queueByRoom;
    const io = socketService.getIo();


    socket.on("addTask", (req) => {
        queueByRoom(req.room, () => handleAddTask(req, socket, clients, io));
    });


    socket.on("deleteTask", (req, callback) => {
        queueByRoom(req.room, () => handleDeleteTask(req, callback, io));
    });
};


async function handleAddTask(req, socket, clients, io) {
    const { room, newTask } = req;
    const usersToNotify = newTask.userRef === "allUsers"
        ? Object.keys(clients).filter(key => clients[key].room === room).map(key => clients[key].name)
        : [newTask.userRef];

    for (const username of usersToNotify) {
        const taskData = {
            name: newTask.name,
            userRef: username
        };

        const res = await controllerRoom.addTask(room, taskData);

        const targetSocketId = Object.keys(clients).find(
            key => clients[key].name === username && clients[key].room === room
        );

        if (targetSocketId) io.to(targetSocketId).emit('tasksToDo', res);

    }
}

async function handleDeleteTask(req, callback, io) {
    const { room, taskId, task } = req;

    await controllerRoom.deleteTask(room, taskId);
    const res = await controllerTask.addTask(task);

    if (res) callback({ status: "ok" });
    else callback({ status: "error" });

}
