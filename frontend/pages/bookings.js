export default {
  template: `
    <div class="container">
      <h2>Booking List</h2>
      <div class="search-container">
        <input v-model="searchQuery" @input="searchBookings" type="text" class="form-control" placeholder="Search by Booking ID" />
      </div>

      <table class="table table-striped">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Customer Name</th>
            <th>Service</th>
            <th>Service Provider</th>
            <th>Booking Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in filteredBookings" :key="booking.id">
            <td>{{ booking.id }}</td>
            <td>{{ booking.username }}</td>
            <td>{{ booking.service }}</td>
            <td>{{ booking.post_name }}</td>
            <td>{{ formatDate(booking.booking_date) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,

  data() {
    return {
      bookings: [],
      searchQuery: "",  // To hold the search input value
      filteredBookings: [],  // To hold filtered bookings
    }
  },

  methods: {
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    searchBookings() {
      // If search query is empty, show all bookings
      if (this.searchQuery === "") {
        this.filteredBookings = this.bookings;
      } else {
        // Filter bookings based on the search query (Booking ID)
        this.filteredBookings = this.bookings.filter(booking =>
          booking.id.toString().includes(this.searchQuery)
        );
      }
    },
  },

  async mounted() {
    const res = await fetch(location.origin + "/api/bookings", {
      headers: {
        "auth-token": this.$store.state.auth_token,
      },
    });

    if (res.ok) {
      this.bookings = await res.json();
      this.filteredBookings = this.bookings;  // Initialize filtered bookings with all bookings
    } else {
      alert("Failed to fetch bookings");
    }
  }
}
