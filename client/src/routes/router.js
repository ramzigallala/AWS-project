import { createRouter, createWebHistory } from 'vue-router'
import NotFound from '../components/NotFound.vue'
import Register from "../components/authentication/Register.vue"
import Login from '../components/authentication/Login.vue'
import RoomGateway from "../components/gateway/RoomGateway.vue";
import TasksDone from "../components/tasks/TasksDone.vue"


const routes = [
    { path: '/', name:"login", component: Login },
    { path: '/register', name:"register", component: Register },
    { path: '/room/:id?', name:"room", component: RoomGateway },
    { path: '/enterRoom', name:"enterRoom", component: RoomGateway },
    { path: '/tasksDone', name:"tasksDone", component: TasksDone },
    { path: '/:pathMatch(.*)*',  component: NotFound }

]
const router = createRouter({
    history: createWebHistory(), // try with createWebHashHistory()
    routes
});
/**
 * Global navigation guard to check if the user is logged in.
 *
 */
router.beforeEach((to, from, next) => {
    const utenteLoggato = !!sessionStorage.getItem('user');

    if((to.name === "login" || to.name === "register") && !utenteLoggato){
        next()
    }else{

        if(utenteLoggato){
            next()
        }else{
            next({ name: 'login' })
        }
    }
})

export {router}
