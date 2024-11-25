const store = new Vuex.Store({
    state: {
        // its like data
        auth_token: null,
        role: null,
        loggedin: false,
        user_id: null,
    },
    mutations: {
        // its like methods with state change
        setUser(state) {
            try {
                if (JSON.parse(localStorage.getItem("user"))) {
                    const user = JSON.parse(localStorage.getItem("user"));
                    
                    state.auth_token = user.token;
                    state.role = user.role;
                    state.loggedin = true;
                    state.user_id = user.user_id;
                }
            } catch (e) {
                console.warn("not logged in");
                console.log(e);
            }
        },
        logout(state) {
            state.auth_token = null;
            state.role = null;
            state.loggedin = false;
            state.user_id = null;

            localStorage.removeItem("user");
        },
    },
    actions: {
        // its like methods but async
        // actions commits mutations
    },
});


store.commit("setUser");

export default store;
