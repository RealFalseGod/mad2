export default {
  template: `
    <div>
        <router-link to="/"> home </router-link>
        <router-link v-if="!$store.state.loggedin" to="/login"> login </router-link>
        <router-link v-if="!$store.state.loggedin" to="/register"> register </router-link>
        <router-link v-if="$store.state.loggedin && $store.state.role == 'admin'" to="/admin-dashboard"> admin page </router-link>
        <router-link v-if="$store.state.loggedin && $store.state.role == 'user'" to="/services"> services </router-link>
        <router-link v-if="$store.state.loggedin && $store.state.role == 'staff'" to="/create-post"> create post </router-link>
        <button v-if="$store.state.loggedin" class="btn btn-secondary" @click="$store.commit('logout')"> Logout </button>

    </div>
    `,
};
