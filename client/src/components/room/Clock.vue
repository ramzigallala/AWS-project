<template>
  <div class="container d-flex justify-content-center align-items-center flex-column pt-5" >
    <div class="rounded-circle border border-4 border-info d-flex flex-column justify-content-center align-items-center" style="width: 300px; height: 300px;">
      <h2 class="state-heading">{{ state }}</h2>
      <div class="d-flex justify-content-center mb-4 gap-3 $">
        <button class="btn fs-3" @click="startTimer">
          <i class="fas fa-play text-white"></i>
        </button>
        <button class="btn fs-3" @click="pauseTimer">
          <i class="fas fa-pause text-white"></i>
        </button>
        <button class="btn fs-3" @click="stopTimer">
          <i class="fas fa-stop text-white"></i>
        </button>
      </div>
      <h2 class="time-heading">{{ timeVal }}</h2>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';

const socket = inject('socket');
const room = inject('room');
const isVisibleHourglass = inject('isVisibleHourglass');

const state = ref('');
const timeVal = ref('');

function startTimer() {
  socket.emit('startTimer', room.value);
}

function pauseTimer() {
  socket.emit('pauseTimer', room.value);
}

function stopTimer() {
  socket.emit('stopTimer', room.value);
}
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const paddedMins = String(mins).padStart(2, '0');
  const paddedSecs = String(secs).padStart(2, '0');

  return `${paddedMins}:${paddedSecs}`;
}
/**
 * Formats the timer state into a user-friendly string.
 *
 * @param {string} state - The state of the timer (work, shortBreak, longBreak).
 * @returns {string} The formatted state as a user-friendly string (Pomodoro, Pausetta, Pausa).
 */
function formatState(state) {
  let res;
  switch(state) {
    case 'work':
      res="Pomodoro";
      break;
    case 'shortBreak':
      res="Pausetta";
      break;
    case 'longBreak':
      res="Pausa";
      break;
    default:
        res="Errore";
      break;
  }
  return res;
}
// On component mount, listen for timer events from the server
onMounted(() => {
  socket.on('timer', (time, newState, type) => {
    isVisibleHourglass.value = type !== 'running' && type !== 'paused';
    timeVal.value = formatTime(time);
    state.value = formatState(newState);
  });
});
</script>
<style>
.state-heading {
  font-size: 2.5rem;
}
.time-heading {
  font-size: 3rem;
}

@media (max-width: 576px) {
  .state-heading {
    font-size: 2rem;
  }
}
</style>
