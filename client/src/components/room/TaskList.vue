<template>
  <div
      class="modal d-block "
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5);"
      v-if="isPopupOpen"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content text-dark">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title">Aggiungi Task</h5>
          <button type="button" class="btn-close btn-close-white" @click="closePopupEmpty" ></button>
        </div>
        <form @submit.prevent="closePopup">
          <div class="modal-body">
            <div class="mb-3">
              <label for="taskName" class="form-label">Nome Task:</label>
              <input
                  type="text"
                  id="taskName"
                  class="form-control"
                  placeholder="Inserisci il nome del task"
                  v-model="taskName"
                  required
              />
            </div>
            <div class="mb-3">
              <div class="form-check">
                <input
                    class="form-check-input"
                    type="radio"
                    id="allUsers"
                    name="optionUsers"
                    value="allUsers"
                    v-model="selectedOption"
                    required
                />
                <label class="form-check-label" for="allUsers">Assegna a tutti</label>
              </div>
            </div>
            <label class="form-label">Assegna a:</label>
            <div class="mb-3" style="max-height: 200px; overflow-y: auto;">
              <div class="form-check" v-for="name in userList" :key="name">
                <input
                    class="form-check-input"
                    type="radio"
                    :id="name"
                    name="optionUsers"
                    :value="name"
                    v-model="selectedOption"
                />
                <label class="form-check-label" :for="name">{{ name }}</label>
              </div>
            </div>

          </div>
          <div class="modal-footer">
            <button class="btn custom-btn  w-100" type="submit">Aggiungi Task</button>
          </div>
        </form>

      </div>
    </div>
  </div>
  <div id="task-list" class="task-list">
    <h2 class="text-center">I tuoi Task</h2>
    <div class="text-center mb-2">
      <button
          id="add-task-button"
          class="btn btn-outline-light"
          @click="addTask"
      >
        <i class="fas fa-plus"></i>
      </button>
    </div>
    <ul class="list-group">
      <li
          class="d-flex list-group-flush border-bottom"
          v-for="[key, task] in taskList"
          :key="key"
      >
        {{ task.name }}
        <button class="btn btn-sm btn-primary ms-auto mb-2" @click="taskDone(key, task.name)">FATTO</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { inject, ref, reactive, onMounted } from 'vue';

const socket = inject('socket');
const room = inject('room');

defineProps({
  userList: Array
});

const isPopupOpen = ref(false);
const selectedOption = ref('');
const taskName = ref('');
const taskList = reactive(new Map());

const user = JSON.parse(sessionStorage.getItem('user'));


function addTask() {
  isPopupOpen.value = true;
}
/**
 * Closes the task creation popup and emits an event to add the new task.
 * This function collects the task details and sends them via WebSocket.
 */
function closePopup() {
  isPopupOpen.value = false;
  const newTask = {
    name: taskName.value,
    userRef: selectedOption.value
  };
  taskName.value = '';
  selectedOption.value = '';
  socket.emit('addTask', { room: room.value, newTask });
}


function closePopupEmpty(){
  isPopupOpen.value = false;
}
/**
 * Marks a task as done and removes it from the task list.
 * This function is triggered when the user completes a task.
 * It emits a socket event to delete the task from the server.
 *
 * @param {string} taskId - The ID of the task to delete.
 * @param {string} taskName - The name of the task to delete.
 */
function taskDone(taskId, taskName) {
  const task = {
    name: taskName,
    room: room.value,
    userRef: user.email
  };
  socket.emit('deleteTask', { room: room.value, task, taskId }, (response) => {
    if (response.status === 'ok') {
      taskList.delete(taskId);
    }
  });
}
/**
 * Initializes the component by listening for incoming tasks and updating the task list.
 * When tasks are received via the socket.
 */
onMounted(() => {
  socket.on('tasksToDo', (res) => {
    if(Array.isArray(res)){
      taskList.clear();
      res.forEach(task => {
        taskList.set(task._id, task);
      });
    }else{
      taskList.set(res._id, res);
    }
  });
});
</script>
