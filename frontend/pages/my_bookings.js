export default {
  template: `
  <div class="bookings">
  <h1>Your Bookings</h1>

  <!-- Filter options -->
  <div>
    <label for="statusFilter">Filter by Status:</label>
    <select v-model="statusFilter" @change="filterBookings">
      <option value="pending">Pending</option>
      <option value="rejected">Rejected</option>
      <option value="accepted">Accepted</option>
    </select>
  </div>

  <!-- Check if the bookings data is available -->
  <div v-if="filteredBookings.length > 0">
    <table class="booking-table">
      <thead>
        <tr>
          <th>Booking ID</th>
          <th>Status</th>
          <th>Booking Date</th>
          <th>Post Name</th>
          <th>Service</th>
          <th>Content</th>
          <th>Price</th>
          <th>Posted by</th>
          <th>Action</th> <!-- For the 'Done' button when accepted -->
        </tr>
      </thead>
      <tbody>
        <tr v-for="booking in filteredBookings" :key="booking.id">
          <td>{{ booking.id }}</td>
          <td>{{ booking.status }}</td>
          <td>{{ formatDate(booking.booking_date) }}</td>
          <td>{{ booking.post_details.name }}</td>
          <td>{{ booking.post_details.service }}</td>
          <td>{{ booking.post_details.content }}</td>
          <td>{{ booking.post_details.price }}</td>
          <td>{{ booking.post_details.username }}</td>
          <td>
            <div v-if="booking.status === 'accepted' && !booking.reviewSubmitted">
              <!-- 'Done' button for accepted bookings -->
              <button v-if="!booking.showReviewBox" @click="showReviewBox(booking.id)">Done</button>
              <div v-if="booking.showReviewBox">
                <!-- Text box for review -->
                <textarea v-model="booking.reviewText" placeholder="Write your review..."></textarea>
                <br />
                <!-- Rating input for stars -->
                <label for="stars">Rating (1-5):</label>
                <select v-model="booking.rating">
                  <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
                </select>
                <br />
                <button @click="submitReview(booking.id)">Submit Review</button>
              </div>
            </div>
            <!-- Cancel button for pending bookings -->
            <div v-if="booking.status === 'pending'">
              <button @click="cancelBooking(booking.id)">Cancel</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Show a message if no bookings are available -->
  <div v-else>
    <p>You have no bookings yet.</p>
  </div>
</div>
  `,
  
  data() {
    return {
      bookings: [], // Array to store the service bookings
      statusFilter: "pending", // Default status filter
      filteredBookings: [], // Array to store filtered bookings based on status
      loading: true, // To track loading state
      error: null, // To track if there's any error
    };
  },
  
  methods: {
    // Method to format booking date
    formatDate(date) {
      const d = new Date(date);
      return d.toLocaleString(); // Adjust the format as needed
    },
  
    // Method to fetch the bookings from the API
    async fetchBookings() {
      try {
        const res = await fetch(`${location.origin}/api/books`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': this.$store.state.auth_token, // Ensure to include the token for auth
          },
        });
  
        if (res.ok) {
          const data = await res.json();
          this.bookings = Array.isArray(data)
            ? data.map((booking) => ({
                ...booking,
                showReviewBox: false, // Add this property to each booking
                reviewText: '', // For storing the review text
                rating: 1, // Default rating value
                reviewSubmitted: false, // Track if the review is submitted
              }))
            : [];
          this.filterBookings(); // Apply the filter initially after loading the bookings
        } else {
          const errorData = await res.json();
          console.error("Error fetching bookings:", errorData);
          this.error = errorData.message || "Failed to load bookings";
        }
      } catch (error) {
        console.error("Fetch bookings error:", error);
        this.error = "An error occurred while fetching bookings.";
      } finally {
        this.loading = false;
      }
    },
  
    // Filter bookings based on the selected status filter
    filterBookings() {
      this.filteredBookings = this.bookings.filter((booking) => {
        return booking.status === this.statusFilter;
      });
    },
  
    // Method to show review box when 'Done' is clicked
    showReviewBox(bookingId) {
      const booking = this.bookings.find((b) => b.id === bookingId);
      if (booking) {
        booking.showReviewBox = true;
      }
    },

    // Method to submit the review
    submitReview(bookingId) {
      const booking = this.bookings.find((b) => b.id === bookingId);
  if (!booking) {
    alert("Booking not found.");
    return;
  }

  // Prepare the data to send in the API request
  const payload = {
    review: booking.reviewText,
    stars: booking.rating,
  };

  // Make the API call
  fetch(`${location.origin}/api/review/${bookingId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "auth-token": this.$store.state.auth_token, // Include auth token
    },
    body: JSON.stringify(payload),
    
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
        console.log(payload)
      } else {
        return response.json().then((error) => {
          throw new Error(error.message || "Failed to submit review");
        });
      }
    })
    .then((data) => {
      // Mark the review as submitted and display success message
      booking.reviewSubmitted = true;
      alert("Review submitted successfully!");
    })
    .catch((error) => {
      // Handle errors (e.g., network issues, validation errors)
      console.error("Error submitting review:", error);
      alert(`Error submitting review: ${error.message}`);
    });
    },
    async cancelBooking(bookingId) {
      
      const booking = this.bookings.find((b) => b.id === bookingId);
      if (!booking) {
        alert("Booking not found.");
        return;
      }
  
      // Make the API call to cancel the booking
      try {
        const response = await fetch(`${location.origin}/api/bookings/cancel/${bookingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "auth-token": this.$store.state.auth_token, // Include auth token
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          // Update the booking status after cancellation
          booking.status = "cancelled"; // Update the status
          alert("Booking cancelled successfully!");
        } else {
          const errorData = await response.json();
          alert(errorData.message || "Failed to cancel booking.");
        }
      } catch (error) {
        console.error("Error cancelling booking:", error);
        alert("An error occurred while cancelling the booking.");
      }
    },
  },
  
  async mounted() {
    // Ensure the user is authenticated and the necessary details are available
    if (!this.$store.state.user_id || !this.$store.state.auth_token) {
      this.error = "User is not authenticated";
      this.loading = false;
      return;
    }
  
    // Fetch the bookings from the API
    await this.fetchBookings();
  },
};
