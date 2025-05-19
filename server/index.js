const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const controllerRoom = require('./controller/roomController');
const { getSocketService } = require('./services/SocketService');
const setupHandlers = require('./handlers/index');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', require('./routes/tasks'));
app.use('/api', require('./routes/auth'));

const server = createServer(app);
const io = new Server(server, {
    cors: { origin: '*' },
    pingInterval: 3000,
    pingTimeout: 2000,
});

const socketService = getSocketService(io);
const uri = process.env.MONGO_URL || 'mongodb://localhost:27017/PomodoroDB';

mongoose.connect(uri)
    .then(async () => {
        await controllerRoom.deleteCollection();

        io.on('connection', (socket) => {
            setupHandlers(socket, socketService);
        });

        server.listen(3000, () => {
            console.log('Server in ascolto su http://localhost:3000');
        });
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err.message);
    });
