const { io } = require("socket.io-client");
describe('Task Assignment Test', () => {
    const room = 'testRoom7';
    const task = { name: 'Task test', userRef: 'allUsers' };

    it('Assign a task to all users in the room', async () => {
        const socket1 = io('http://localhost:3000', {
            transports: ['websocket']
        });
        const socket2 = io('http://localhost:3000', {
            transports: ['websocket']
        });

        const once = (socket, event) => new Promise((resolve) => socket.once(event, resolve));

        await Promise.all([
            once(socket1, 'connect'),
            once(socket2, 'connect')
        ]);

        await new Promise((resolve) => socket1.emit('createRoom', { room: room, user: 'user1' }, resolve));
        await new Promise((resolve) => socket2.emit('joinRoom', { room: room, user: 'user2' }, resolve));

        const taskPromise1 = once(socket1, 'tasksToDo');
        const taskPromise2 = once(socket2, 'tasksToDo');

        socket1.emit('addTask', { room: room, newTask: task });

        const [task1, task2] = await Promise.all([taskPromise1, taskPromise2]);

        expect(task1.name).toBe(task.name);
        expect(task2.name).toBe(task.name);

        socket1.disconnect();
        socket2.disconnect();
    });
});

describe('Test of task assignment to different user', () => {
    const room = 'testRoom8';
    const task = { name: 'Task test', userRef: 'user2' };

    it('Assign a task to a user other than oneself', async () => {
        const socket1 = io('http://localhost:3000', {
            transports: ['websocket']
        });
        const socket2 = io('http://localhost:3000', {
            transports: ['websocket']
        });

        const once = (socket, event) => new Promise((resolve) => socket.once(event, resolve));

        await Promise.all([
            once(socket1, 'connect'),
            once(socket2, 'connect')
        ]);

        await new Promise((resolve) => socket1.emit('createRoom', { room, user: 'user1' }, resolve));
        await new Promise((resolve) => socket2.emit('joinRoom', { room, user: 'user2' }, resolve));

        const taskPromise = once(socket2, 'tasksToDo');
        const taskPromise2 = once(socket1, 'tasksToDo');


        socket1.emit('addTask', { room, newTask: task });

        const task1 = await taskPromise;
        expect(task1.name).toBe(task.name);

        const timerEndRace = Promise.race([
            taskPromise2,
            new Promise((resolve) => setTimeout(() => resolve('timeout'), 3000))
        ]);

        const result = await timerEndRace;

        expect(result).toBe('timeout');

        socket1.disconnect();
        socket2.disconnect();
    });
});

describe('Task removal test', () => {
    const room = 'testRoom9';
    const task = { name: 'Task test', userRef: 'user1' };
    const taskToDelete = { name: 'Task test', room:room, userRef: 'user1' };

    it('Removes a task once the "fatto" button has been pushed', async () => {
        const socket1 = io('http://localhost:3000', {
            transports: ['websocket']
        });

        const once = (socket, event) => new Promise((resolve) => socket.once(event, resolve));

        await once(socket1, 'connect');
        await new Promise((resolve) => socket1.emit('createRoom', { room: room, user: 'user1' }, resolve));

        socket1.emit('addTask', { room: room, newTask: task });
        const assignedTask = await once(socket1, 'tasksToDo');


        const deleteTaskResponse = await new Promise((resolve) => socket1.emit('deleteTask', { room: room, task: taskToDelete, taskId: assignedTask._id }, resolve));


        expect(deleteTaskResponse.status).toBe('ok');

        const tasksAfterDeletion = once(socket1, 'tasksToDo');


        const timerEndRace = Promise.race([
            tasksAfterDeletion,
            new Promise((resolve) => setTimeout(() => resolve('timeout'), 3000))
        ]);

        const result = await timerEndRace;

        expect(result).toBe('timeout');

        socket1.disconnect();
    });
});