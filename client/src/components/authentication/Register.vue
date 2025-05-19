<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <form @submit.prevent="register" class="card p-4 shadow-sm">
          <div class="text-center mb-3">
            <p class="fw-bold fs-4">Inserisci:</p>
          </div>
          <div class="alert alert-danger d-flex align-items-start gap-3 p-3" v-if="isErrorVisible">
            <i class="bi bi-exclamation-circle fs-4"></i>
            <div class="text-sm">
              <strong>Errore:</strong> {{message}}
            </div>
          </div>
          <div class="form-outline mb-3">
            <label class="form-label" for="registerName">Name</label>
            <input v-model="name" type="text" class="form-control" id="registerName" required />
          </div>

          <div class="form-outline mb-3">
            <label class="form-label" for="registerUsername">Username</label>
            <input v-model="surname" type="text" class="form-control" id="registerUsername" required />
          </div>

          <div class="form-outline mb-3">
            <label class="form-label" for="registerEmail">Email</label>
            <input v-model="email" type="email" class="form-control" id="registerEmail" required />
          </div>

          <div class="form-outline mb-3">
            <label class="form-label" for="registerPassword">Password</label>
            <input v-model="password" type="password" class="form-control" id="registerPassword" required />
          </div>
          <div>
            <p>
              Hai già un account?
              <RouterLink to="/" custom v-slot="{ navigate, href }">
                <a :href="href" @click="navigate" class="text-primary">
                  Effettua il login
                </a>
              </RouterLink>
            </p>
          </div>
          <button type="submit" class="btn custom-btn w-100 mb-3">Iscriviti</button>
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
const name = ref('');
const surname = ref('');
const password = ref('');
const isErrorVisible = ref(false);
const message = ref('');

/**
 * Handles the registration process.
 * Sends a POST request to the backend with the provided email, name, surname, and password.
 * On success, redirects the user to the login page. On failure, displays an error message.
 *
 * @async
 * @function register
 */
const register = async () => {
  try {
    const res = await axios.post('http://localhost:3000/api/register', {
      email: email.value,
      name: name.value,
      surname: surname.value,
      password: password.value,
    });
    if(res.status === 201){
      isErrorVisible.value=false;
      router.push('/');
    }
    message.value = res.data.message;
  } catch (err) {
    isErrorVisible.value=true;
    message.value = err.response.data.message;
  }
};
</script>
