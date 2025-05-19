const { io } = require("socket.io-client");

describe('Room creation test with timing', () => {
    const room = 'testRoom2';

    test('Create a room and check the timing', (done) => {
        const socket = io('http://localhost:3000', {
            transports: ['websocket']
        });

        socket.on('connect', () => {
            socket.emit('createRoom', {room: room}, (res) => {
                expect(res.status).toBe('room creata');
            });
            socket.on("timerSetting", (timerSetting) => {
                expect(timerSetting.work).toBe(1500);
                expect(timerSetting.shortBreak).toBe(300);
                expect(timerSetting.longBreak).toBe(900);
                socket.disconnect();
                done();

            });
        });

    });
});



describe('Test of room time change', () => {
    const room = 'testRoom3';
    const newTimeSetting = {
        room: room,
        work: 50,
        shortBreak: 10,
        longBreak: 20
    };
    const workTimeStart =1500;

    test('Change the room times and check that everyone gets them', (done) => {
        const socket1 = io('http://localhost:3000', {
            transports: ['websocket']
        });
        const socket2 = io('http://localhost:3000', {
            transports: ['websocket']
        });

        socket1.on('connect', () => {
            socket1.emit('createRoom', { room: room, user: 'user1' }, () => {
                socket2.emit('joinRoom', { room: room, user: 'user2' }, () => {


                    socket1.emit('changeTimeSetting', newTimeSetting);

                    let count = 0;

                    const checkTimerSetting = (timerSetting) => {
                        if(timerSetting.work !== workTimeStart){
                            expect(timerSetting.work).toBe(newTimeSetting.work);
                            expect(timerSetting.shortBreak).toBe(newTimeSetting.shortBreak);
                            expect(timerSetting.longBreak).toBe(newTimeSetting.longBreak);
                            count++;
                            if (count === 2) {
                                socket1.disconnect();
                                socket2.disconnect();
                                done();
                            }
                        }
                    };

                    socket1.on('timerSetting', checkTimerSetting);
                    socket2.on('timerSetting', checkTimerSetting);
                });
            });
        });
    });
});




describe('Timer test', () => {
    const room = 'testRoom4';
    const time = 5;
    let socket1, socket2;

    afterEach(() => {
        if (socket1?.connected) socket1.disconnect();
        if (socket2?.connected) socket2.disconnect();
    });

    test('Starts the timer and verifies that both users receive the end-of-timer signal', async () => {
        socket1 = io('http://localhost:3000', {
            transports: ['websocket']
        });
        socket2 = io('http://localhost:3000', {
            transports: ['websocket']
        });


        const once = (socket, event) =>
            new Promise((resolve) => socket.once(event, resolve));
        const waitForTimerType = (socket, event, typeToCheck) => new Promise((resolve) => {
            const handler = (time, state, type) => {
                if (type === typeToCheck) {
                    socket.off('timer', handler);
                    resolve();
                }
            };
            socket.on(event, handler);
        });


        await Promise.all([
            once(socket1, 'connect'),
            once(socket2, 'connect')
        ]);


        await new Promise((res) => socket1.emit('createRoom', { room: room, user: 'user1' }, res));
        await new Promise((res) => socket2.emit('joinRoom', { room: room, user: 'user2' }, res));


        socket1.emit('changeTimeSetting', { room: room, work: time, shortBreak: 1, longBreak: 1 });




        socket1.emit('startTimer', room);
        await once(socket1, 'timer');
        const startTime = Date.now();


        await Promise.all([
            waitForTimerType(socket1, 'timer',"finished"),
            waitForTimerType(socket2, 'timer',"finished")
        ]);
        const endTime = Date.now();
        const elapsed = endTime - startTime;

        expect(elapsed).toBeGreaterThanOrEqual(time * 1000 - 100);
    }, 10000);
});

describe('Pause timer test', () => {
    const room = 'testRoom5';
    const time = 5;

    it('Starts the timer, pauses it and checks that the end does not come', async () => {
        const socket1 = io('http://localhost:3000', {
            transports: ['websocket']
        });
        const socket2 = io('http://localhost:3000', {
            transports: ['websocket']
        });

        const once = (socket, event) => new Promise((resolve) => socket.once(event, resolve));
        const waitForTimerType = (socket, event, typeToCheck) => new Promise((resolve) => {
            const handler = (time, state, type) => {
                if (type === typeToCheck) {
                    socket.off('timer', handler);
                    resolve();
                }
            };
            socket.on(event, handler);
        });
        await Promise.all([
            once(socket1, 'connect'),
            once(socket2, 'connect')
        ]);

        await new Promise((resolve) => socket1.emit('createRoom', { room: room, user: 'user1' }, resolve));
        await new Promise((resolve) => socket2.emit('joinRoom', { room: room, user: 'user2' }, resolve));

        socket1.emit('changeTimeSetting', { room: room, work: time, shortBreak: 1, longBreak: 1 });
        socket1.emit('startTimer', room);

        await new Promise((resolve) => setTimeout(resolve, 1000));
        socket1.emit('pauseTimer', room);

        const timerEndPromise1 = waitForTimerType(socket1, 'timer',"finished");
        const timerEndPromise2 = waitForTimerType(socket2, 'timer',"finished");
        await new Promise((resolve) => setTimeout(resolve, 3000));




        const timerEndRace = Promise.race([
            timerEndPromise1,
            timerEndPromise2,
            new Promise((resolve) => setTimeout(() => resolve('timeout'), 3000))
        ]);

        const result = await timerEndRace;

        expect(result).toBe('timeout');

        socket1.disconnect();
        socket2.disconnect();
    }, 10000);
});

describe('Timer status change test', () => {
    const room = 'testRoom6';
    const workTime = 2;
    const shortBreakTime = 1;

    it('Starts the timer, finishes work and switches to short break', async () => {
        const socket1 = io('http://localhost:3000', {
            transports: ['websocket']
        });
        const socket2 = io('http://localhost:3000', {
            transports: ['websocket']
        });

        const once = (socket, event) => new Promise((resolve) => socket.once(event, resolve));

        const waitForTimerType = (socket, event, typeToCheck) => new Promise((resolve) => {
            const handler = (time, state, type) => {
                if (type === typeToCheck) {
                    socket.off('timer', handler);
                    resolve(state);
                }
            };
            socket.on(event, handler);
        });
        await Promise.all([
            once(socket1, 'connect'),
            once(socket2, 'connect')
        ]);

        await new Promise((resolve) => socket1.emit('createRoom', { room: room, user: 'user1' }, resolve));
        await new Promise((resolve) => socket2.emit('joinRoom', { room: room, user: 'user2' }, resolve));

        socket1.emit('changeTimeSetting', { room, work: workTime, shortBreak: shortBreakTime, longBreak: 2 });

        socket1.emit('startTimer', room);

        const timerStatePromise1 = waitForTimerType(socket1, 'timer',"finished");
        const timerStatePromise2 = waitForTimerType(socket2, 'timer',"finished");

        await new Promise((resolve) => setTimeout(resolve, 4000));
        const states = await Promise.all([timerStatePromise1, timerStatePromise2]);
        expect(states.some((state) => state === 'shortBreak')).toBe(true);

        socket1.disconnect();
        socket2.disconnect();
    });
});


