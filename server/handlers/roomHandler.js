/**
 * Handles socket events related to room management, including creating and joining rooms.
 *
 * @param {import('socket.io').Socket} socket - The socket instance representing the connected client.
 * @param {Object} socketService - A shared service object
 *
 * Events Handled:
 * - "createRoom": Initializes a room and then joins the user to it.
 * - "joinRoom": Adds a user to an existing room and sends back the current room state.
 */

module.exports = function manageRoom(socket, socketService) {
    const queueByRoom = socketService.queueByRoom;

    socket.on("createRoom", (data, callback) => {
        queueByRoom(data.room, () => handleCreateRoom(socketService, data, callback, socket));
    });

    socket.on("joinRoom", (data, callback) => {
        queueByRoom(data.room, () => handleJoinRoom(socketService, data, callback, socket));
    });

};

const controllerRoom = require('../controller/roomController');



async function handleCreateRoom(socketService, req, callback, socket) {
    const res = await controllerRoom.initializeRoom(req.room);
    if (res.status === "ok") {
        await handleJoinRoom(socketService, req, callback, socket);
    } else {
        callback({ status: res.status });
    }
}


async function handleJoinRoom(socketService, data, callback, socket) {
    const { room, user } = data;
    const io = socketService.getIo();

    const res = await controllerRoom.checkRoom(room);
    if (!res.present) {
        callback({ status: "La stanza non esiste" });
        return;
    }

    socket.join(room);
    socketService.addClient(socket.id, user, room);

    const isUserInRoom = await controllerRoom.checkUserInRoom(room, user);
    if (isUserInRoom) {
        callback({ status: "Utente già presente nella stanza" });
        return;
    }

    const updateRes = await controllerRoom.addUserToRoom(room, user);
    if (updateRes.success) {
        const tasksUser = getTaskNamesByUser(updateRes.doc.tasks, user);

        io.to(socket.id).emit('tasksToDo', tasksUser);

        io.to(room).emit('users', updateRes.doc.listUsers);

        const timersRoom = socketService.timersRoom;
        if (timersRoom.has(room)) {
            io.to(room).emit('timer', timersRoom.get(room).time, updateRes.doc.state.typeSession, "paused");
        } else {
            io.to(room).emit('timer', updateRes.doc.timeSetting[updateRes.doc.state.typeSession], updateRes.doc.state.typeSession, "start");
        }

        io.to(room).emit('timerSetting', updateRes.doc.timeSetting);
    }

    callback({ status: "ok" });
}

function getTaskNamesByUser(tasks, targetUserRef) {
    return tasks
        .filter(task => task.userRef === targetUserRef);

}
