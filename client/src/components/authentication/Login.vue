<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <form @submit.prevent="login" class="card p-4 shadow-sm">
          <div class="text-center mb-3">
            <p class="fw-bold fs-4">Inizia ora</p>
          </div>
          <div class="alert alert-danger d-flex  gap-3 p-3"  v-if="isErrorVisible" >
            <i class="bi bi-exclamation-circle fs-4"></i>
            <div class="text-sm">
              <strong>Errore:</strong> {{message}}
            </div>
          </div>
          <div class="form-outline mb-3">
            <label class="form-label" for="loginName">Email</label>
            <input v-model="email" type="email" class="form-control" placeholder="Inserisci la tue email" required />
          </div>
          <div class="form-outline mb-3">
            <label class="form-label" for="loginPassword">Password</label>
            <input v-model="password" type="password" class="form-control" id="loginPassword" required />
          </div>
          <div>
            <p>
              Non hai un account?
              <RouterLink to="/register" custom v-slot="{ navigate, href }">
                <a :href="href" @click="navigate" class="text-primary">
                  Registrati
                </a>
              </RouterLink>
            </p>
          </div>
          <button type="submit" class="btn custom-btn w-100 mb-3">Entra</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
const router = useRouter();

const email = ref('');
const password = ref('');
const message = ref('');
const isErrorVisible = ref(false);
/**
 * Handles the login process.
 * It sends a POST request to the backend with the provided email and password.
 * On success, it stores the user information in sessionStorage and redirects to the "enterRoom" page.
 * On failure, it shows an error message.
 *
 * @async
 * @function login
 */
const login = async () => {
  try {
    const emailUsed = email.value;
    const res = await axios.post('http://localhost:3000/api/login', {
      email: email.value,
      password: password.value,
    });
    if(res.status === 200){
      sessionStorage.user= JSON.stringify({name:res.data.name, email:emailUsed});
      await router.push({ name: 'enterRoom'});
      isErrorVisible.value=false;
    }
  } catch (err) {
    console.log(err);
    isErrorVisible.value=true;
    message.value = err.response.data.message;
  }
};
</script>

