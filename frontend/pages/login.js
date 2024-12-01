export default {
    template: `
    <div class="login-container">
    <h2 class="login-title">Login</h2> <!-- Login Title -->
        <input placeholder='email' v-model='email' class="login-input" />
        <input placeholder='password' type='password' v-model='password' class="login-input" />
        <button class='btn btn-primary' @click="submitLogin" class="login-btn">Login</button>
    </div>
      `,
    data() {
        return {
            email: null,
            password: null,
        };
    },
    methods: {
        async submitLogin() {
            const res = await fetch(location.origin + "/login", {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: this.email,
                    password: this.password,
                }),
                method: "POST",
            });
            if (res.ok) {
                console.log("we are logged in sir")
                const data = await res.json()
                console.log(data)

                localStorage.setItem('user', JSON.stringify(data))
                
                this.$store.commit('setUser')
                this.$router.push('/')
            }else{
                const err = await res.json()
                alert(err.error || "Login failed");
            }
        },
    },
};
