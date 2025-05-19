<template>
  <div class="d-flex flex-grow-1">
    <div class="d-flex flex-column flex-grow-1 mb-5">
      <EnterRoom v-show="!roomEntered" @enteredRoom="enterRoom" />
      <Room v-show="roomEntered" />
    </div>
    <SideBar/>
  </div>
</template>

<script setup>
import { ref, provide, inject, watch } from 'vue';
import {useRouter, useRoute, onBeforeRouteLeave} from 'vue-router';
import EnterRoom from './EnterRoom.vue';
import Room from '../room/Room.vue';
import SideBar from '@/components/gateway/SideBar.vue';

const roomEntered = ref(false);
const isVisibleHourglass = ref(false);
const room = ref('');

provide('isVisibleHourglass', isVisibleHourglass);
provide('room', room);


const socket = inject('socket');

const router = useRouter();
const route = useRoute();
/**
 * Handles the event of entering a room.
 * - Displays the loading hourglass indicator.
 * - Updates the room value and navigates to the room's page.
 *
 * @param {string} roomId - The ID of the room to enter.
 */
function enterRoom(roomId) {
  isVisibleHourglass.value = true;
  room.value = roomId;
  roomEntered.value = true;
  router.push(`/room/${roomId}`);
}
onBeforeRouteLeave((to, from, next) => {
  if (!(to.name === "room" && !roomEntered.value)) next();
});
/**
 * Watches for changes in the route path and handles the exit from the room when the user navigates away.
 * - Emits an 'exitRoom' socket event when the user leaves the "enterRoom" path.
 */
watch(
    () => route.path,
    (newPath) => {
      if (newPath === '/enterRoom') {
        roomEntered.value = false;
        socket.emit('exitRoom');
      }
    }
);
</script>

