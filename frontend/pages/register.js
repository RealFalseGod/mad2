export default {
    template: `
    <div>
        <input placeholder='email' v-model='email' />
        <input placeholder='Username' v-model='username' />        
        <input placeholder='password' v-model='password' />
        <input placeholder='address' v-model='address' />
        <input placeholder='pincode' v-model='pincode' />
        <input placeholder='role' v-model='role' />
        <button @click="submitLogin"> register </button>
    </div>
      `,
    data() {
        return {
            username: null,
            email: null,
            password: null,
            address: null,
            pincode: null,
            role: null,
        };
    },
    methods: {
        async submitLogin() {
            const res = await fetch(location.origin + "/register",
                {
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: this.email,
                        username: this.username,
                        password: this.password,
                        address: this.address,
                        pincode: this.pincode,
                        role: this.role,
                    }),
                    method: "POST",
                });
            if (res.ok) {
                console.log("we are registered in sir");
                const errorData = await res.json();
                console.error("Registration failed:", errorData);
                
            }
        },
    },
};
