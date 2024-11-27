export default {
  template: `
    <div>
        <input type="email" placeholder='email' v-model='email' />
        <input placeholder='Username' v-model='username' />        
        <input type="password" placeholder='password' v-model='password' />
        <input placeholder='address' v-model='address' />
        <input type="number" placeholder='pincode' v-model='pincode' />
        <select v-model="role">
            <option disabled value="">Select role</option>
            <option value="user">User</option>
            <option value="staff">Staff</option>
        </select>

        <button class='btn btn-primary' @click="submitLogin"> register </button>
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
      const res = await fetch(location.origin + "/register", {
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
      }
    },
  },
};
