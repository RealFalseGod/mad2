export default {
  template: `
  <div>
  <div v-if="isLoading" class="loading-message">
    <p>Loading...</p>
  </div>

  <div v-else>
    <div v-if="userRole === 'user'" class="user-dashboard">
      <h2 class="section-heading">User Bookings</h2>
      <div v-if="bookings.length === 0" class="no-data">
        <p>No bookings found.</p>
      </div>
      <div v-else class="bookings-table">
        <table border="1">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Post ID</th>
              <th>Booking Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in bookings" :key="booking.id">
              <td>{{ booking.id }}</td>
              <td>{{ booking.post_id }}</td>
              <td>{{ booking.booking_date }}</td>
              <td>{{ booking.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="section-heading">Your Reviews</h2>
      <div v-if="reviews.length === 0" class="no-data">
        <p>No reviews found.</p>
      </div>
      <div v-else class="reviews-table">
        <table border="1">
          <thead>
            <tr>
              <th>Review ID</th>
              <th>Post ID</th>
              <th>Star Rating</th>
              <th>Review Content</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="review in reviews" :key="review.id">
              <td>{{ review.id }}</td>
              <td>{{ review.p_id }}</td>
              <td>{{ review.star }}</td>
              <td>{{ review.content }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="userRole === 'staff'" class="staff-dashboard">
      <h2 class="section-heading">Staff Overview</h2>
      <table class="overview-table" border="1">
        <tbody>
          <tr>
            <th>Jobs Done</th>
            <td>{{ jobsDone }}</td>
          </tr>
          <tr>
            <th>Star Rating</th>
            <td>{{ stars }}</td>
          </tr>
        </tbody>
      </table>

      <h2 class="section-heading">Staff's Bookings</h2>
      <div v-if="bookings.length === 0" class="no-data">
        <p>No bookings found for this staff.</p>
      </div>
      <div v-else class="bookings-table">
        <table border="1">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Post ID</th>
              <th>Booking Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in bookings" :key="booking.id">
              <td>{{ booking.id }}</td>
              <td>{{ booking.post_id }}</td>
              <td>{{ booking.booking_date }}</td>
              <td>{{ booking.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="section-heading">Reviews for this Staff</h2>
      <div v-if="reviews.length === 0" class="no-data">
        <p>No reviews found for this staff.</p>
      </div>
      <div v-else class="reviews-table">
        <table border="1">
          <thead>
            <tr>
              <th>Review ID</th>
              <th>User ID</th>
              <th>Star Rating</th>
              <th>Review Content</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="review in reviews" :key="review.id">
              <td>{{ review.id }}</td>
              <td>{{ review.user_id }}</td>
              <td>{{ review.star }}</td>
              <td>{{ review.content }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

  `,
  data() {
    return {
      userId: null, // Store the user ID from route params
      userRole: null, // Role of the user (user or staff)
      bookings: [], // Bookings data
      reviews: [], // Reviews data
      posts: [], // Posts data (if staff)
      jobsDone: 0, // Jobs done by staff
      stars: 0, // Star rating for the staff
      isLoading: true, // Loading state for the fetch request
    };
  },
  mounted() {
    // Access the user ID from the route params
    this.userId = this.$route.params.id;
    console.log("User ID received:", this.userId);

    // Fetch data on mount
    this.fetchUserData();
  },
  methods: {
    async fetchUserData() {
      try {
        const response = await fetch(`${location.origin}/api/admin_book/${this.userId}`, {
          headers: {
            "Content-Type": "application/json",
            "auth-token": this.$store.state.auth_token, // Use the token from Vuex store
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("API Response:", data);

          // Update the component state
          this.userRole = data.user_role;
          this.bookings = data.bookings;
          this.reviews = data.reviews;
          this.posts = data.posts;

          // If the user is a staff, get the jobs done and stars
          if (this.userRole === "staff") {
            this.jobsDone = data.jobs_done || 0;
            this.stars = data.stars || 0;
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
  },
};
