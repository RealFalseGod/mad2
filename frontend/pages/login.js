export default {
    template: `
    <div>
        <input placeholder='email' v-model='email' />
        <input placeholder='password' type='password' v-model='password' />
        <button class='btn btn-primary' @click="submitLogin"> Login </button>
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
                this.$router.push('/services')
            }else{
                const err = await res.json()
                alert(err.error || "Login failed");
            }
        },
    },
};
