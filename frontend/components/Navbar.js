export default {
  template: `
  <div class="nav-container">
    <router-link class="nav-link" to="/">Home</router-link>
    <router-link class="nav-link" v-if="!$store.state.loggedin" to="/login">Login</router-link>
    <router-link class="nav-link" v-if="!$store.state.loggedin" to="/register">Register</router-link>
    <router-link class="nav-link" v-if="$store.state.loggedin && $store.state.role == 'admin'" to="/admin-dashboard">Admin Page</router-link>
    <router-link class="nav-link" v-if="$store.state.loggedin && $store.state.role == 'user'" to="/services">Services</router-link>
    <router-link class="nav-link" v-if="$store.state.loggedin && $store.state.role == 'staff'" to="/posts">My Posts</router-link>
    <router-link class="nav-link" v-if="$store.state.loggedin && $store.state.role == 'staff'" to="/create-post">Create Post</router-link>
    <router-link class="nav-link" v-if="$store.state.loggedin && $store.state.role == 'staff'" to="/view_request">View Requests</router-link>
    <router-link class="nav-link" v-if="$store.state.loggedin && $store.state.role == 'user'" to="/my_bookings">My bookings</router-link>
    <router-link class="nav-link" v-if="$store.state.loggedin && $store.state.role == 'admin'" to="/authorized">Authorized</router-link>
    <button class="btn-logout" v-if="$store.state.loggedin" @click="logout">Logout</button>
  </div>
    `,
    methods: {
      logout() {
        // Commit logout mutation
        this.$store.commit('logout');
        
        // Redirect to login page after logout
        this.$router.push('/login');
      }
    }
};
