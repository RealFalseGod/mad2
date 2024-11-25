export default {
  template: `
    <div>
        <router-link to="/"> home </router-link>
        <router-link to="/login"> login </router-link>
        <router-link to="/register"> register </router-link>
        <button class="btn btn-secondary" @click="$store.commit('logout')"> Logout </button>
    </div>
    `,
};
