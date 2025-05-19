<template>
  <div class="d-flex vh-100">
    <div class="container d-flex justify-content-center mt-5">
      <div class="list-group w-100">
        <a
            v-for="(task, index) in tasks"
            :key="index"
            class="list-group-item list-group-item-action flex-column align-items-start mb-4"
        >
          <div class="d-flex justify-content-between">
            <h5 class="mb-1">Task {{index+1}}: {{ task.name }}</h5>
          </div>
          <p class="mb-1">Stanza: {{ task.room }}</p>
        </a>
      </div>
    </div>
    <SideBar/>
  </div>
</template>
<script setup>
import {onMounted, ref} from 'vue';
import SideBar from "@/components/gateway/SideBar.vue";
import axios from "axios";
const tasks = ref([]);
/**
 * On component mounted, fetches the list of completed tasks from the API.
 * The request is made passing the user's email in the body.
 *
 */
onMounted(async () => {
  try {
    const userId = JSON.parse(sessionStorage.getItem('user'))?.email;
    const res = await axios.post('http://localhost:3000/api/tasksDone', {userId});
    tasks.value = res.data;
  } catch (err) {
    console.log("error", err.response.data.message);
  }
});
</script>
