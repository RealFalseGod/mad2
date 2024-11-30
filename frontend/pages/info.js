export default {
    template: `
      <div>
        <h1>User Info</h1>
        <p><strong>User ID:</strong> {{ userId }}</p> <!-- Display the user ID -->
        
        <!-- Display loading state or user data -->
        <div v-if="isLoading">Loading...</div>
        <div v-else-if="userData">
          <p><strong>Name:</strong> {{ userData.name }}</p>
          <p><strong>Email:</strong> {{ userData.email }}</p>
          <!-- Add other user data fields as needed -->
        </div>
        <div v-else>
          <p>Error fetching user data.</p>
        </div>
  
        <!-- Example of services display -->
        <h2>Booked Services</h2>
        <ul>
  <li v-for="service in bookedServices" :key="service.id">
    <strong>Service:</strong> {{ service.service }} 
    <br>
    <strong>Post Name:</strong> {{ service.post_name }}
    <br>
    <strong>Booking Date:</strong> {{ new Date(service.booking_date).toLocaleDateString() }} <!-- Optional: Format the date -->
  </li>
</ul>
        <h2>Provided Services</h2>
        <ul>
          <li v-for="service in providedServices" :key="service.id">{{ service.name }}</li>
        </ul>
      </div>
    `,
    data() {
      return {
        userId: null, // Store the user ID from route params
        userData: null, // Store the fetched user data
        isLoading: true, // Loading state for the fetch request
        providedServices: [],
        bookedServices: [],
        userRole: null, // Store user role (user or staff)
      };
    },
    mounted() {
      // Access the user ID from the route params
      this.userId = this.$route.params.id;
  
      // Log the user ID to check if it's correctly passed
      console.log("User ID received:", this.userId);
  
      // Fetch data on mount
      this.fetchUserData();
    },
    methods: {
      async fetchUserData() {
        try {
          const response = await fetch(`${location.origin}/api/user/${this.userId}`, {
            headers: {
              'Content-Type': 'application/json',
              'auth-token': this.$store.state.auth_token, // Use the token from Vuex store
            },
          });
  
          if (response.ok) {
            this.userData = await response.json();
            console.log("User Data:", this.userData);
  
            // Determine user role based on roles array
            this.userRole = this.userData.roles.includes("staff") ? "staff" : "user";
            
            // Fetch services based on the role
            if (this.userRole === "user") {
              await this.fetchBookedServices();
            } else if (this.userRole === "staff") {
              await this.fetchProvidedServices();
            }
          } else {
            console.error(`Error: ${response.status} - ${response.statusText}`);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          this.isLoading = false;
        }
      },
  
      async fetchBookedServices() {
        try {
          const response = await fetch(`${location.origin}/api/user/${this.userId}/bookings`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'auth-token': this.$store.state.auth_token, // Include the auth token for authentication
            },
            
          });
          console.log(`Fetching bookings from: ${location.origin}/api/user/${this.userId}/bookings`);

          if (response.ok) {
            this.bookedServices = await response.json();
          } else {
            const errorData = await response.json();
            console.error("Failed to fetch booked services:", errorData.message);
          }
        } catch (error) {
          console.error("Error fetching booked services:", error);
        }
      },
  
      async fetchProvidedServices() {
        try {
          const response = await fetch(`${location.origin}/api/user/${this.userId}/provided-services`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'auth-token': this.$store.state.auth_token, // Include the auth token for authentication
            },
          });
  
          if (response.ok) {
            this.providedServices = await response.json();
          } else {
            const errorData = await response.json();
            console.error("Failed to fetch provided services:", errorData.message);
          }
        } catch (error) {
          console.error("Error fetching provided services:", error);
        }
      },
    },
  };
  