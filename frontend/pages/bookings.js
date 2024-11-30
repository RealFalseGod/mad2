export default {
    template: `
    <div class="container">
    <h2>Booking List</h2>
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
        <tr v-for="booking in bookings" :key="booking.id">
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
            bookings: []
        }
    },
    methods: {
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        }
    },

    async mounted() {
        const res = await fetch(location.origin + "/api/bookings", {
            headers: {
                "auth-token": this.$store.state.auth_token,
            },
        });
        if (res.ok) {
            this.bookings = await res.json();
        }else{
            alert("Failed to fetch bookings");
        }

    }
}