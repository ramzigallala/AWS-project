<template>
  <div>
    <div class="container mt-5" style="max-width: 600px;">
      <div class="card shadow">
        <div class="card-body">
          <h2 class="text-center mb-4">Crea o Entra in una stanza</h2>
          <div class="alert alert-danger d-flex gap-3 p-3" v-if="isErrorVisible">
            <i class="bi bi-exclamation-circle fs-4"></i>
            <div class="text-sm">
              <strong>Errore:</strong> {{ message }}
            </div>
          </div>
          <form @submit.prevent="handleSubmit" class="mb-3">
            <label for="roomName" class="form-label fw-bold">Nome della stanza:</label>
            <input type="text" v-model="roomName" class="form-control" id="roomName" required/>
            <div class="d-inline-flex w-100 mt-2">
              <button type="submit" value="create" class="btn custom-btn w-50 me-2" >Crea</button>
              <button type="submit" value="join" class="btn custom-btn w-50 ms-2" >Unisciti</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, inject} from 'vue';

const socket = inject('socket');
const emit = defineEmits(['enteredRoom']);

const roomName = ref('');
const username = JSON.parse(sessionStorage.getItem('user'));
const isErrorVisible = ref(false);
const message = ref('');
const change = ref(false);

/**
 * Creates a new room by emitting a socket event.
 * - The user is assigned to the room upon creation.
 * - If successful, emits the 'enteredRoom' event with the room name.
 * - If there is an error, displays the error message.
 */
const createRoom = () => {
  socket.emit('createRoom', {room: roomName.value, user: username.email}, (response) => {
    if (response.status === 'ok') {
      change.value = true;
      isErrorVisible.value = false;
      emit('enteredRoom', roomName.value);
    } else {
      message.value = response.status;
      isErrorVisible.value = true;
    }
  });
}
/**
 * Joins an existing room by emitting a socket event.
 * - The user is assigned to the room upon successful join.
 * - If successful, emits the 'enteredRoom' event with the room name.
 * - If there is an error, displays the error message.
 */
const joinRoom = () => {
  socket.emit('joinRoom', {room: roomName.value, user: username.email}, (response) => {
    if (response.status === 'ok') {
      change.value = true;
      isErrorVisible.value = false;
      emit('enteredRoom', roomName.value);
    } else {
      message.value = response.status;
      isErrorVisible.value = true;
    }
  });
}

const handleSubmit = (event) => {
  const action = event.submitter?.value;
  if (action === "create") {
    createRoom();
  } else if (action === "join") {
    joinRoom();
  }
};
</script>

