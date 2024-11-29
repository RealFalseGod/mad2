import Navbar from "./components/Navbar.js";
import router from "./utils/router.js";
import store from "./utils/store.js";

const app = new Vue({
    el: "#app",
    template: `
        <div>
            <h3>welcome {{$store.state.user_name}}</h3>
            <h1><Navbar /></h1>
            
            <router-view> </router-view>
        </div>
    `,

    components: {
        Navbar,
    },
    router,
    store,
});
