export default {
    template: `
    <div>
        <input placeholder='Username' v-model='text' />
        <input placeholder='email' v-model='email' />
        <input placeholder='password' v-model='password' />
        <button @click="submitLogin"> Login </button>
    </div>
      `,
    data() {
        return {
            text: null,
            email: null,
            password: null,
        };
    },
    methods: {
        async submitLogin() {
            const res = await fetch(location.origin + "/login", 
                {
                    headers: { "Content-Type": "application/json" },
                    body: { text: this.text, email: this.email, password: this.password },
                    method: "POST",
                });
            if (res.ok) {
                console.log("we are logged in sir");
                data = await res.json();
                console.log(data);
            }
        },
    },
};
