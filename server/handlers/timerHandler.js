const controllerRoom = require('../controller/roomController');
/**
 * Handles socket events related to timer management within rooms.
 *
 * @param {import('socket.io').Socket} socket - The socket instance representing the connected client.
 * @param {Object} socketService - A shared service object
 *
 * Events Handled:
 * - "startTimer": Starts the timer for the specified room.
 * - "pauseTimer": Pauses the timer for the specified room.
 * - "stopTimer": Stops the timer for the specified room.
 * - "changeTimeSetting": Changes the time settings for the specified room.
 */
module.exports = function manageTimer(socket, socketService) {
    const queueByRoom = socketService.queueByRoom;

    socket.on('startTimer', (room) => {
        queueByRoom(room, () => handleStartTimer(socketService, room));
    });

    socket.on('pauseTimer', (room) => {
        queueByRoom(room, () => handlePauseTimer(socketService, room));
    });

    socket.on('stopTimer', (room) => {
        queueByRoom(room, () => handleStopTimer(socketService, room));
    });

    socket.on('changeTimeSetting', (req) => {
        queueByRoom(req.room, () => handleChangeTimeSetting(socketService, req));
    });
};

async function handleStartTimer(socketService, room) {
    const timersRoom = socketService.timersRoom;

    if (!timersRoom.has(room)) {
        const timeSetting = await controllerRoom.getActualTime(room);
        timersRoom.set(room, {
            time: timeSetting.actualTime,
            interval: undefined,
            stateRoom: timeSetting.typeState
        });
        startTimer(socketService, timeSetting.actualTime, room, timeSetting.typeState);
    } else if (typeof timersRoom.get(room).interval === "undefined") {
        const data = timersRoom.get(room);
        startTimer(socketService, data.time, room, data.stateRoom);
    }
}

function startTimer(socketService, counterStart, room, stateRoom) {
    const timersRoom = socketService.timersRoom;
    const io = socketService.getIo();
    const counterStop = 0;
    const intervalTime = 1000;

    const tempRoom = timersRoom.get(room);
    tempRoom.interval = setInterval(async () => {
        tempRoom.time--;

        io.to(room).emit('timer', tempRoom.time, stateRoom, "running");

        if (tempRoom.time <= counterStop) {
            clearInterval(tempRoom.interval);
            timersRoom.delete(room);
            await notifyTimeEnd(io, room);
        } else {
            timersRoom.set(room, tempRoom);
        }
    }, intervalTime);

    timersRoom.set(room, tempRoom);
}

async function notifyTimeEnd(io, room) {
    await controllerRoom.changeTypeSession(room);
    const timeSetting = await controllerRoom.getActualTime(room);
    io.to(room).emit('timer', timeSetting.actualTime, timeSetting.typeState,"finished");
}

function handlePauseTimer(socketService, room) {
    const timersRoom = socketService.timersRoom;
    if (timersRoom.has(room)) {
        const tempRoom = timersRoom.get(room);
        clearInterval(tempRoom.interval);
        tempRoom.interval = undefined;
        timersRoom.set(room, tempRoom);
    }
}

async function handleStopTimer(socketService, room) {
    const timersRoom = socketService.timersRoom;
    if (timersRoom.has(room)) {
        clearInterval(timersRoom.get(room).interval);
        await notifyTimeEnd(socketService.getIo(), room);
        timersRoom.delete(room);
    }
}

async function handleChangeTimeSetting(socketService, req) {
    const io = socketService.getIo();

    const res = await controllerRoom.changeTimeSetting(req.room, {
        work: req.work,
        shortBreak: req.shortBreak,
        longBreak: req.longBreak
    });

    if (res.success) {
        io.to(req.room).emit('timerSetting', res.configuration);
        io.to(req.room).emit('timer', res.actualTimer.actualTime, res.actualTimer.typeState, "start");
    } else {
        console.error("Error when changing timer times");
    }
}
