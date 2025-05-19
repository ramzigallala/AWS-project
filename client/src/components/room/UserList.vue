<template>
  <nav id="cc" class="fixed-bottom container-fluid">
    <div id="usersList" class="container-fluid d-flex py-3 overflow-x-auto">
    </div>
  </nav>
</template>
<script setup>
import { inject, onMounted, nextTick } from 'vue';

const socket = inject('socket');
const emit = defineEmits(['updatedUserList']);

function nameToColor(name) {
  return `#${name
      .split('')
      .reduce((hash, char) => hash + char.charCodeAt(0), 0)
      .toString(16)
      .padStart(6, '0')
      .slice(0, 6)}`;
}
/**
 * Mounted hook that listens for the 'users' event from the socket.
 * When the event is received, it updates the user list in the UI
 * and initializes Bootstrap tooltips for each user icon.
 */
onMounted(() => {
  socket.on('users', (users) => {
    nextTick(() => {
      emit('updatedUserList', users);
      const usersListEl = document.getElementById('usersList');
      if (!usersListEl) return;
      usersListEl.replaceChildren();
      users.forEach(user => {
        const icon = document.createElement('i');
        icon.classList.add('bi', 'bi-circle-fill', 'pe-2');
        icon.setAttribute('data-bs-toggle', 'tooltip');
        icon.setAttribute('data-bs-placement', 'top');
        icon.setAttribute('data-bs-title', user);
        icon.style.color = nameToColor(user);
        usersListEl.appendChild(icon);
      });
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      [...tooltipTriggerList].forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl, { boundary: document.body });
      });
    });
  });
});
</script>
