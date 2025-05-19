<template>
  <div class="container-fluid d-flex flex-column min-vh-100">
    <div v-if="connectionStatus" class="connection-status">
      <h1>{{ connectionStatus }}</h1>
    </div>
    <h1 class="titleSite text-white text-center">SharedPomodoro</h1>
    <router-view />
  </div>
</template>

<style scoped>
.titleSite {
  font-family: "Playpen Sans Deva", cursive;
  font-optical-sizing: auto;
  font-weight: 500;
  font-style: normal;
  font-size: clamp(2.5rem, 5vw, 4rem);
  margin-top: 0;
  margin-bottom: 0;
  padding-top: 10px;
}

.connection-status {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 10;
}
</style>

<script setup>
import { inject, ref, onMounted } from 'vue';
import {useRoute, useRouter} from 'vue-router';
const route = useRoute();
const router = useRouter();
const dissolveErrorTime = 2000;

const socket = inject('socket');
const connectionStatus = ref('');

onMounted(() => {

  socket.on('disconnect', (reason) => {
    connectionStatus.value = 'Disconnesso dal server. Riconnessione in corso...';
  });

  socket.io.on('reconnect', () => {
    connectionStatus.value = 'Connesso di nuovo al server!';
    manageReconnection(socket);

    setTimeout(() => {
      connectionStatus.value = '';
    }, dissolveErrorTime);
  });
});
/**
 * Manages room rejoining after a socket reconnection.
 * If the user was in a room before disconnection, they will be automatically rejoined.
 *
 * @param {Object} socket - The socket instance used for communication.
 */
function manageReconnection(socket){
  const room = route.params.id;
  if(room !== undefined){
    const username = JSON.parse(sessionStorage.getItem('user'));
    socket.emit('joinRoom', {room: room, user: username.email}, (response) => {
      if (response.status !== 'ok') router.push({ name: 'enterRoom'});
    });
  }
}
</script>
