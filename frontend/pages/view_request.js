export default {
    template: `
      <div class="view-bookings">
        <h1>Service Bookings</h1>
  
        <!-- Loading state -->
        <div v-if="loading">
          <p>Loading...</p>
        </div>
  
        <!-- Error message -->
        <div v-if="error">
          <p class="error">{{ error }}</p>
        </div>
  
        <!-- Display bookings if available -->
        <div v-if="!loading && !error && bookings.length > 0">
          <h2>Bookings</h2>
          <ul>
            <li v-for="(booking, index) in bookings" :key="booking.booking_id" class="booking-item">
              <p><strong>Booking ID:</strong> {{ booking.booking_id }}</p>
              <p><strong>Booking Date:</strong> {{ formatDate(booking.booking_date) }}</p>
              <p><strong>Service Name:</strong> {{ booking.service }}</p>
              <p><strong>Service Post Name:</strong> {{ booking.name }}</p>
              >
              <p><strong>User:</strong> {{ booking.user_name }}</p>
            </li>
          </ul>
        </div>
  
        <!-- If no bookings are found -->
        <div v-if="!loading && !error && bookings.length === 0">
          <p>No bookings found for this user.</p>
        </div>
      </div>
    `,
  
    data() {
      return {
        bookings: [],  // Array to store the service bookings
        loading: true,  // To track loading state
        error: null,    // To track if there's any error
      };
    },
  
    methods: {
      // Method to format booking date
      formatDate(date) {
        const d = new Date(date);
        return d.toLocaleString(); // Adjust the format as needed
      }
    },
  
    async mounted() {
      // Ensure the user is authenticated and the necessary details are available
      if (!this.$store.state.user_id || !this.$store.state.auth_token) {
        this.error = 'User is not authenticated';
        this.loading = false;
        return;
      }
  
      try {
        // Fetch the service bookings related to the logged-in staff member
        const res = await fetch(`${location.origin}/api/bookings/${this.$store.state.user_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': this.$store.state.auth_token, // Include the auth token for authentication
          },
        });
  
        if (res.ok) {
            console.log(res)
          const data = await res.json();
          this.bookings =data; // Ensure bookings is an array
          console.log(this.bookings);

        } else {
          const errorData = await res.json();
          this.error = errorData.message || "Failed to load bookings";  // Show error message if any
        }
      } catch (error) {
        this.error = error.message || error.toString();  // Catch and show fetch error
      } finally {
        this.loading = false;  // Set loading to false once data is fetched or error occurs
      }
    },
  };
  