export default {
    template: `
      <div>
        <div v-if="posts.length === 0">Loading posts...</div>
        <div v-else>
          <table border="1" cellpadding="10" cellspacing="0">
            <thead>
              <tr>
                <th>Post Name</th>
                <th>Service</th>
                <th>Content</th>
                <th>Price</th>
                <th>Created By</th>
                <th>Total Jobs</th>
                <th>Average Stars</th>
                <th>Address</th> <!-- Added Address column -->
                <th>Pincode</th> <!-- Added Pincode column -->
                <th>Booking Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="post in posts" :key="post.id">
                <td>{{ post.name }}</td>
                <td>{{ post.service }}</td>
                <td>{{ post.content }}</td>
                <td>{{ post.price }}</td>
                <td>{{ post.username }}</td>
                <td>{{ post.total_jobs }}</td>
                <td>{{ post.average_stars }}</td>
                <td>{{ post.address }}</td> <!-- Display Address -->
                <td>{{ post.pincode }}</td> <!-- Display Pincode -->
                <td>
                  <input type="date" v-model="post.bookingDate" :min="minDate" />
                </td>
                <td>
                  <button @click="bookService(post)">Book</button> <!-- Pass the post to the method -->
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `,
    data() {
      return {
        posts: [],  // Array to store posts data
      };
    },
    created() {
      // Fetch posts data when the component is created
      this.fetchPosts();
    },
    methods: {
      // Method to fetch posts from the API
      async fetchPosts() {
        try {
          const response = await fetch(`${location.origin}/api/post_list`, {
            headers: {
              "Content-Type": "application/json",
              "auth-token": this.$store.state.auth_token,  // Assuming you're using token-based authentication
            },
          });
          if (response.ok) {
            this.posts = await response.json();  // Store the fetched posts data
            console.log(this.posts);
          } else {
            console.error("Failed to fetch posts", response.status);
          }
        } catch (error) {
          console.error("Error fetching posts:", error);
        }
      },
    
      // Method to book the service
      async bookService(post) {
        if (!post.bookingDate) {
          alert("Please select a booking date.");
          return;
        }
    
        // Send the post_id and booking_date to the backend
        try {
          const response = await fetch(`${location.origin}/api/book_service`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token": this.$store.state.auth_token,  // Assuming you're using token-based authentication
            },
            body: JSON.stringify({
              post_id: post.id,             // Send the post's ID
              booking_date: post.bookingDate, // Send the selected booking date
            }),
          });
    
          if (response.ok) {
            alert("Booking successful!");
            post.bookingDate = ''; // Optionally clear the date field after successful booking
            // Optionally, refresh posts or update the UI here
          } else {
            const errorData = await response.json();
            console.error("Error:", errorData.message);
            alert(errorData.message || "Booking failed. Please try again.");
          }
        } catch (error) {
          console.error("Error booking service:", error);
        }
      }
    },
    computed: {
      minDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');  // Ensure two-digit month
        const day = String(today.getDate()).padStart(2, '0');  // Ensure two-digit day
        return `${year}-${month}-${day}`;  // Return in the format YYYY-MM-DD
      },
    }
  };
  