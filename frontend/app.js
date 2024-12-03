import Navbar from "./components/Navbar.js";
import router from "./utils/router.js";
import store from "./utils/store.js";

const app = new Vue({
    el: "#app",
    template: `
    <div>
    <!-- Navbar Component -->
    <h1>
      <Navbar />
    </h1>


    <!-- Router View -->
    <router-view></router-view>
  </div>
    `,
    components: {
        Navbar,
    },
    router,
    store,

    computed: {
        // Computed property to check if the user is logged in
        isLoggedIn() {
            // You can adjust this to check for a more appropriate flag in your store, 
            // such as user authentication status
            return !!this.$store.state.user_name; // Returns true if user_name is not null/undefined
        }
    }
});
