import { createApp } from 'vue'
import App from './App.vue'
import {router} from './routes/router.js'
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000', {
    transports: ['websocket']
});
const app = createApp(App);
app.provide('socket', socket);
app.use(router).mount('#app');

