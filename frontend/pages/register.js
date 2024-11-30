export default {
  template: `
    <div class="register-container">
        <h2 class="register-title">Register</h2>
        
        <div class="form-group">
            <input type="email" placeholder="Email" v-model="email" class="form-input" />
        </div>
        
        <div class="form-group">
            <input placeholder="Username" v-model="username" class="form-input" />
        </div>

        <div class="form-group">
            <input type="password" placeholder="Password" v-model="password" class="form-input" />
        </div>

        <div class="form-group">
            <input placeholder="Address" v-model="address" class="form-input" />
        </div>

        <div class="form-group">
            <input type="number" placeholder="Pincode" v-model="pincode" class="form-input" />
        </div>

        <div class="form-group">
        <h3 class="register-title">Select Role</h3>
            <select v-model="role" class="form-input">
            <option disabled value="">Select role</option>
                <option value="user">User</option>
                <option value="staff">Staff</option>
            </select>
        </div>

        <button class="btn btn-primary" @click="submitLogin">Register</button>
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
        console.log("Registration successful");
        this.$router.push('/login');
      }
    },
  },
};
