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

    <!-- Filter options -->
    <div v-if="!loading && !error" class="filter-container">
        <label for="statusFilter">Filter by status:</label>
        <select v-model="statusFilter" id="statusFilter">
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="done">Done</option>
        </select>
    </div>

    <!-- Display bookings in a table if available -->
    <div v-if="!loading && !error && filteredBookings.length > 0" class="bookings-container">
        <h2>Bookings</h2>
        <table class="bookings-table">
            <thead>
                <tr>
                    <th>Booking ID</th>
                    <th>Booking Date</th>
                    <th>Service Name</th>
                    <th>Service Post Name</th>
                    <th>User</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(booking, index) in filteredBookings" :key="booking.booking_id">
                    <td>{{ booking.booking_id }}</td>
                    <td>{{ formatDate(booking.booking_date) }}</td>
                    <td>{{ booking.service }}</td>
                    <td>{{ booking.name }}</td>
                    <td>{{ booking.user_name }}</td>
                    <td>
                        <button 
                            @click="acceptBooking(booking.booking_id)" 
                            class="accept-btn" 
                            :disabled="booking.status !== 'pending'">
                            Accept
                        </button>
                        <button 
                            @click="rejectBooking(booking.booking_id)" 
                            class="reject-btn" 
                            :disabled="booking.status !== 'pending'">
                            Reject
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- If no bookings are found -->
    <div v-if="!loading && !error && filteredBookings.length === 0" class="no-bookings-message">
        <p>No bookings found for this status.</p>
    </div>
</div>

  `,
  data() {
    return {
      bookings: [], // Array to store the service bookings
      loading: true, // To track loading state
      error: null, // To track if there's any error
      statusFilter: 'pending', // To track the selected filter status (pending, accepted, rejected)
    };
  },

  computed: {
    // Filter bookings based on selected status
    filteredBookings() {
      return this.bookings.filter(booking => booking.status === this.statusFilter);
    },
  },

  methods: {
    // Method to format booking date
    formatDate(date) {
      const d = new Date(date);
      return d.toLocaleString(); 
    },

    // Method to handle accept action
    async acceptBooking(bookingId) {
      try {
        const res = await fetch(`${location.origin}/api/bookings/accept/${bookingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': this.$store.state.auth_token,
          },
        });
        if (res.ok) {
          alert('Booking accepted successfully!');
          this.bookings = this.bookings.filter(booking => booking.booking_id !== bookingId);
        } else {
          const errorData = await res.json();
          console.error("Error accepting booking:", errorData);
          alert(errorData.message || 'Failed to accept the booking.');
        }
      } catch (error) {
        console.error("Accept booking error:", error);
        alert('Error while accepting the booking.');
      }
    },

    // Method to handle reject action
    async rejectBooking(bookingId) {
      try {
        const res = await fetch(`${location.origin}/api/bookings/reject/${bookingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': this.$store.state.auth_token,
          },
        });

        if (res.ok) {
          alert('Booking rejected successfully!');
          this.bookings = this.bookings.filter(booking => booking.booking_id !== bookingId);
        } else {
          const errorData = await res.json();
          console.error("Error rejecting booking:", errorData);
          alert(errorData.message || 'Failed to reject the booking.');
        }
      } catch (error) {
        console.error("Reject booking error:", error);
        alert('Error while rejecting the booking.');
      }
    },
  },

  async mounted() {
   
    if (!this.$store.state.user_id || !this.$store.state.auth_token) {
      this.error = 'User is not authenticated';
      this.loading = false;
      return;
    }

    try {
     
      const res = await fetch(`${location.origin}/api/bookings/${this.$store.state.user_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': this.$store.state.auth_token,
        },
      });

      if (res.ok) {
        const data = await res.json();
        this.bookings = Array.isArray(data) ? data : [];
      } else {
        const errorData = await res.json();
        console.error("Error fetching bookings:", errorData);
        this.error = errorData.message || 'Failed to load bookings';
      }
    } catch (error) {
      console.error("Fetch bookings error:", error);
      this.error = 'No bookings found.';
    } finally {
      this.loading = false;
    }
  },
};
