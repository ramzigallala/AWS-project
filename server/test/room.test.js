const { io } = require("socket.io-client");

describe("test single client Socket.IO", () => {
    let socket;

    beforeEach((done) => {
        socket = io('http://localhost:3000', {
            transports: ['websocket']
        });

        socket.on("connect", () => {
            done();
        });
    });

    afterEach(() => {
        if (socket.connected) {
            socket.disconnect();
        }
    });

    test("Client connects to the server", () => {
        expect(socket.connected).toBe(true);
    });


});


describe('Socket.IO server connection test', () => {
    const sockets = [];

    afterAll(() => {
        sockets.forEach(socket => {
            if (socket.connected) {
                socket.disconnect();
            }
        });
    });

    test('All clients connect and disconnect', (done) => {
        const numUser = 100;
        let disconnectedCount = 0;

        for (let i = 1; i <= numUser; i++) {
            const socket = io('http://localhost:3000', {
                transports: ['websocket']
            });
            sockets.push(socket);

            socket.on('connect', () => {
                let timeout = Math.floor(Math.random() * 1000) + 1001;
                setTimeout(() => {
                    socket.disconnect();
                }, timeout);
            });

            socket.on('disconnect', () => {
                disconnectedCount++;
                if (disconnectedCount === numUser) {
                    done();
                }
            });
        }
    });
});




describe('Testing of room connections and disconnections', () => {
    const room = 'testRoom';
    const numUsers = 200;
    const numDisconnection = 50;
    const sockets = [];


    afterAll(() => {
        sockets.forEach(socket => socket.disconnect());
    });

    test("all entered the room",(done) =>{
        const socket = io('http://localhost:3000', {
            transports: ['websocket']
        });
        sockets.push(socket);
        let doneCalled = false;
        const handleUsers = (res) => {
            if (!doneCalled && res.length === numUsers) {
                doneCalled = true;
                done();
            }
        };
        socket.emit("createRoom", { room: room, user:"User1"}, (res) => {
            expect(res.status).toEqual("ok");
            if(res.status === "ok"){
                for (let i = 2; i <= numUsers; i++) {
                    const socket = io('http://localhost:3000', {
                        transports: ['websocket']
                    });
                    socket.on('users', (res) => handleUsers(res));
                    socket.emit('joinRoom', { room: room, user: `User${i}` }, res => {
                        if(res.status !== "ok"){
                            console.log(res.status);
                        }
                    });
                    sockets.push(socket);
                }
            }

        });
        socket.on('users', (res) => handleUsers(res));

    }, 40000);
    test("half leaves the room",(done) =>{

        sockets[0].on('users', (res) => {
            if(res.length === (numUsers-numDisconnection)){
                done();
            }
        });

        for (let i = 1; i <= numDisconnection; i++) {
            sockets[i].emit('exitRoom');
        }


    }, 30000);
}, );


describe('Room creation test', () => {
    const room = 'testRoom1';
    const sockets = [];


    afterAll(() => {
        sockets.forEach(socket => socket.disconnect());

    });
    test('Create a room', (done) => {
        const socket = io('http://localhost:3000', {
            transports: ['websocket']
        });
        sockets.push(socket);
        socket.on('connect', () => {
            socket.emit('createRoom', { room: room , user:"User1"}, (res) => {
                expect(res.status).toBe('ok');
                done();
            });
        });
    });

    test('Attempt to create a room that already exists', (done) => {
        const socket = io('http://localhost:3000', {
            transports: ['websocket']
        });
        sockets.push(socket);

        socket.on('connect', () => {
            socket.emit('createRoom', { room: room , user:"User2"}, (res) => {
                expect(res.status).toBe('La stanza esiste');
                done();
            });
        });
    });
});


describe('Room entrance test', () => {
    const room = 'nonExistingRoom';

    test('Attempt to enter a room that does not exist', (done) => {
        const socket = io('http://localhost:3000', {
            transports: ['websocket']
        });

        socket.on('connect', () => {
            socket.emit('joinRoom', { room: room, user: 'testUser' }, (res) => {
                expect(res.status).toBe('La stanza non esiste');
                socket.disconnect();
                done();
            });
        });
    });
});








