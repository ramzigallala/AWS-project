/**
 * Manages socket connections and related functionalities for handling clients, rooms, and timers.
 * It provides mechanisms to manage clients within rooms, control timers, and handle ordered execution of tasks per room.
 *
 * @class
 * @param {import('socket.io').Server} io - The Socket.io server instance.
 */
class SocketService {
    constructor(io) {
        this.io = io;
        this.clients = {};
        this.timersRoom = new Map();
        this.queueByRoom = this.createKeyedPromiseQueue();
        this.lostRooms = new Map();
    }

    createKeyedPromiseQueue() {
        const chains = new Map();
        return (key, task) => {
            const current = chains.get(key) || Promise.resolve();
            const next = current.then(() => task()).catch(console.error);
            chains.set(key, next);
            return next;
        };
    }

    addClient(socketId, name, room) {
        this.clients[socketId] = { name, room };
    }

    getIo() {
        return this.io;
    }
}

let instance;
function getSocketService(io) {
    if (!instance) {
        instance = new SocketService(io);
    }
    return instance;
}

module.exports = { getSocketService };
