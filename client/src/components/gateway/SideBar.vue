<template>
  <div class="d-flex flex-column">
    <div class="position-relative d-inline-block mb-3">
      <i
          class="bi bi-person fs-3 btn btn-outline-light border-0"
          @mouseenter="showTooltip"
          @mouseleave="hideTooltip"
          @click="changeTooltip"
          style="cursor: pointer;"
      ></i>
      <div
          v-if="tooltipVisible"
          class="position-absolute bg-dark text-white rounded shadow px-3 py-2"
          style="top: 50%; right: 100%; transform: translateY(-50%); margin-right: 8px; white-space: nowrap; z-index: 10;"
      >
        {{ tooltipMessage }}
      </div>
    </div>
    <button
        class="btn btn-outline-light border-0 fs-4 mb-3 bi bi-hourglass"
        v-if="isVisibleHourglass"
        @click="openSidebar"
    ></button>

    <button
        class="btn btn-outline-light border-0 fs-4 mb-3 bi bi-box-arrow-left"
        @click="logOut"
    ></button>

    <button
        class="btn btn-outline-light border-0 fs-4 mb-3 bi bi-list-task"
        @click="tasksDone"
    ></button>
    <button
        class="btn btn-outline-light border-0 fs-4 mb-3 bi bi-house"
        @click="home"
    ></button>

  </div>


  <div class="offcanvas offcanvas-end w-md-25 bg-danger" :class="{ show: isSidebarOpen }" tabindex="-1" id="mySidebar" aria-labelledby="offcanvasLabel">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title text-white" id="offcanvasLabel">Sessioni</h5>
      <button type="button" class="btn-close text-reset" @click="closeSidebar" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
      <div class="container custom-bg rounded pb-5">
        <div class="session-section">
          <h3 class="text-white text-center pt-4 pb-2">Pomodoro: {{ workVal }} min</h3>
          <button class="custom-btn btn d-block mb-2 w-100" @click="takeNum($event, 'workVal')">10</button>
          <button class="custom-btn btn d-block mb-2 w-100" @click="takeNum($event, 'workVal')">15</button>
          <button class="custom-btn btn d-block mb-2 w-100" @click="takeNum($event, 'workVal')">25</button>
          <input class="add-session form-control d-block mb-2" id="workVal" type="number" v-model.number="workValInput" />
        </div>

        <div class="session-section">
          <h3 class="text-white text-center pt-4 pb-2">Pausa corta: {{ shortBVal }} min</h3>
          <button class="custom-btn btn d-block mb-2 w-100" @click="takeNum($event, 'shortBVal')">5</button>
          <button class="custom-btn btn d-block mb-2 w-100" @click="takeNum($event, 'shortBVal')">10</button>
          <button class="custom-btn btn d-block mb-2 w-100" @click="takeNum($event, 'shortBVal')">15</button>
          <input class="add-session form-control d-block mb-2" id="shortBVal" type="number" v-model.number="shortBValInput" />
        </div>

        <div class="session-section">
          <h3 class="text-white text-center pt-4 pb-2">Pausa lunga: {{ longBVal }} min</h3>
          <button class="custom-btn btn d-block mb-2 w-100" @click="takeNum($event, 'longBVal')">25</button>
          <button class="custom-btn btn d-block mb-2 w-100" @click="takeNum($event, 'longBVal')">30</button>
          <button class="custom-btn btn d-block mb-2 w-100" @click="takeNum($event, 'longBVal')">35</button>
          <input class="add-session form-control d-block mb-2" id="longBVal" min="1"  type="number" v-model.number="longBValInput"/>
        </div>
        <p v-if="valError" class="text-white">I tempi devono essere maggiori di 1 minuto.</p>
        <button class="custom-btn btn d-block mt-5  w-100" @click="setsValues">OK</button>
      </div>
    </div>
  </div>
</template>



<script setup>
import { ref, inject, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const socket = inject('socket');
const room = inject('room', undefined);
const injectedIsVisibleHourglass = inject('isVisibleHourglass', false);
const isVisibleHourglass= injectedIsVisibleHourglass || ref(false);

const isSidebarOpen = ref(false);
const workVal = ref(25);
const shortBVal = ref(5);
const longBVal = ref(25);
const valError = ref(false);

const workValInput = ref(workVal.value);
const shortBValInput = ref(shortBVal.value);
const longBValInput = ref(longBVal.value);

const tooltipVisible = ref(false);
const tooltipMessage = ref(JSON.parse(sessionStorage.getItem('user'))?.name);

function isAnyValueLessThanOne() {
  return workValInput.value < 1 || shortBValInput.value < 1 || longBValInput.value < 1;
}
/**
 * Logs out the user by removing their session data and exiting the current room.
 * Redirects the user to the login page after logging out.
 */
function logOut() {
  if(room !== undefined) socket.emit("exitRoom");
  sessionStorage.removeItem("user");
  router.push({ name: 'login' }).catch(err => {
    console.error('Navigation error:', err);
  });
}

function tasksDone() {
  if(room !== undefined) socket.emit("exitRoom");
  router.push({ name: 'tasksDone' }).catch(err => console.error("Errore nella navigazione", err));
}

function openSidebar() {
  valError.value = false;
  isSidebarOpen.value = true;
}

function closeSidebar() {
  isSidebarOpen.value = false;
}

function showTooltip() {
  tooltipVisible.value = true;
}

function hideTooltip() {
  tooltipVisible.value = false;
}

function changeTooltip() {
  tooltipVisible.value = !tooltipVisible.value;
}

function takeNum(event, key) {
  const val = parseInt(event.target.textContent);
  if (!isNaN(val)) {
    if (key === 'workVal') workValInput.value = val;
    if (key === 'shortBVal') shortBValInput.value = val;
    if (key === 'longBVal') longBValInput.value = val;
  }
}
/**
 * Validates and saves the timer values. Sends the updated settings to the server.
 * If any value is less than 1, an error is shown.
 */
function setsValues() {
  if(isAnyValueLessThanOne()){
    valError.value =true;
  } else {
    valError.value =false;
    workVal.value = workValInput.value;
    shortBVal.value = shortBValInput.value;
    longBVal.value = longBValInput.value;
    socket.emit('changeTimeSetting', {
      room: room.value,
      work: workVal.value * 60,
      shortBreak: shortBVal.value * 60,
      longBreak: longBVal.value * 60
    });
  }
}
function home() {
  if(room !== undefined) socket.emit("exitRoom");
  router.push({ name: 'enterRoom'});
}
// Listen for timer settings from the server when the component is mounted
onMounted(() => {
  socket.on('timerSetting', res => {
    workVal.value = res.work / 60;
    shortBVal.value = res.shortBreak / 60;
    longBVal.value = res.longBreak / 60;
  });
});
// Watch for changes in the hourglass visibility and hide the sidebar if the time is running.
watch(isVisibleHourglass, (newVal, oldVal) => {
  if (!newVal) isSidebarOpen.value = false;
});
</script>

<style>
.custom-bg {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>