const controllerRoom = require('../controller/roomController');
const timeoutRoom = 20000;
/**
 * Handles socket events related to user management within rooms.
 *
 * @param {import('socket.io').Socket} socket - The socket instance representing the connected client.
 * @param {Object} socketService - A shared service object.
 *
 * Events Handled:
 * - "disconnect": Handles user disconnection.
 * - "exitRoom": Handles user leaving the room.
 */
module.exports = function userHandler(socket, socketService) {
    const clients = socketService.clients;
    const queueByRoom = socketService.queueByRoom;
    const io = socketService.getIo();


    socket.on('disconnect', () => {
        updateUsers(socket);
    });


    socket.on("exitRoom", () => {
        updateUsers(socket);
    });


    function updateUsers(socket) {
        const userInfo = clients[socket.id];
        if (userInfo) queueByRoom(userInfo.room, () => handleUpdateUsers(socket, userInfo));

    }

    async function handleUpdateUsers(socket, userInfo) {
        const res = await controllerRoom.deleteUserFromRoom(userInfo.room, userInfo.name);
        socket.leave(res.room);

        if (res.users.length === 0) {
            if (socketService.lostRooms.has(userInfo.room)) {
                const interval = socketService.lostRooms.get(userInfo.room);
                clearInterval(interval);
            }
            socketService.lostRooms.set(userInfo.room, setTimeout(() => {
                queueByRoom(userInfo.room, () => handleDeleteRoom(userInfo.room));
                socketService.lostRooms.delete(userInfo.room);
            }, timeoutRoom));

        }
        io.to(res.room).emit('users', res.users);
        delete clients[socket.id];
    }


    async function handleDeleteRoom(room) {
        if (await controllerRoom.isRoomEmpty(room)) {
            await controllerRoom.deleteRoom(room);
            if (socketService.timersRoom.get(room)) {
                clearInterval(socketService.timersRoom.get(room).interval);
                socketService.timersRoom.delete(room);
            }
        }
    }
};
