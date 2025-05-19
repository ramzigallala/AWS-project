<template>
  <div>
      <div class="d-flex flex-column justify-content-center align-items-center flex-grow-1 ">
        <Clock />
        <TaskList :userList="userList" />
      </div>
    <UserList @updatedUserList="handleUserList" />
  </div>
</template>

<script setup>
import {ref} from 'vue';
import TaskList from './TaskList.vue';
import Clock from './Clock.vue';
import UserList from './UserList.vue';

const userList = ref([]);
/**
 * Updates the internal user list with a new list.
 * This function is triggered when the `updatedUserList` event is emitted from the `UserList` component.
 *
 * @param {Array} newUserList - The updated list of users.
 */
function handleUserList(newUserList) {
  userList.value = newUserList;
}
</script>

<style src="../../style/baseStyle.css">
</style>
