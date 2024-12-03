export default {
    template: `
    <div class="post-search-container">
    <!-- Search Bar -->
    <div class="search-bar">
        <label for="searchOption" class="search-label">Search by:</label>
        <select v-model="searchOption" id="searchOption" class="search-select">
            <option value="pincode">Pincode</option>
            <option value="service">Service</option>
            <option value="user">User</option>
        </select>

        <!-- Conditional Input Fields -->
        <input 
            v-if="searchOption === 'pincode'" 
            v-model="searchQuery" 
            type="text" 
            class="search-input"
            placeholder="Enter Pincode" 
        />
        <input 
            v-if="searchOption === 'service'" 
            v-model="searchQuery" 
            type="text" 
            class="search-input"
            placeholder="Enter Service" 
        />
        <input 
            v-if="searchOption === 'user'" 
            v-model="searchQuery" 
            type="text" 
            class="search-input"
            placeholder="Enter User" 
        />

        
    </div>

    <!-- Table Content -->
    <div class="posts-section">
        <div v-if="posts.length === 0" class="loading-message">Loading posts...</div>
        <div v-else>
            <table class="posts-table">
                <thead>
                    <tr>
                        <th>Post Name</th>
                        <th>Service</th>
                        <th>Content</th>
                        <th>Price</th>
                        <th>Created By</th>
                        <th>Total Jobs</th>
                        <th>Average Stars</th>
                        <th>Pincode</th>
                        <th>Address</th>
                        <th>Booking Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="post in filteredPosts" :key="post.id">
                        <td>{{ post.name }}</td>
                        <td>{{ post.service }}</td>
                        <td>{{ post.content }}</td>
                        <td>{{ post.price }}</td>
                        <td>{{ post.username }}</td>
                        <td>{{ post.total_jobs }}</td>
                        <td>{{ post.average_stars }}</td>
                        <td>{{ post.pincode }}</td>
                        <td>{{ post.address }}</td>
                        <td>
                            <input type="date" v-model="post.bookingDate" :min="minDate" class="date-picker" />
                        </td>
                        <td>
                            <button @click="bookService(post)" class="action-button">Book</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

    `,
    data() {
      return {
        posts: [],  // Array to store posts data
        searchOption: 'pincode', // Default search option
      searchQuery: '', // The query to search
      originalPosts: [],    
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
              "auth-token": this.$store.state.auth_token,  
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
              "auth-token": this.$store.state.auth_token,  
            },
            body: JSON.stringify({
              post_id: post.id,             // Send the post's ID
              booking_date: post.bookingDate, // Send the selected booking date
            }),
          });
    
          if (response.ok) {
            alert("Booking successful!");
            post.bookingDate = ''; 
          
          } else {
            const errorData = await response.json();
            console.error("Error:", errorData.message);
            alert(errorData.message || "Booking failed. Please try again.");
          }
        } catch (error) {
          console.error("Error booking service:", error);
        }
      },
      filterPosts() {
        if (!this.searchQuery) {
          this.filteredPosts = this.posts; // If no search query, show all posts
          return;
        }
  
        this.filteredPosts = this.posts.filter(post => {
          const query = this.searchQuery.toLowerCase();
  
          if (this.searchOption === 'pincode' && post.pincode) {
            return post.pincode.toString().includes(query); // Filter by pincode
          }
          if (this.searchOption === 'service' && post.service) {
            return post.service.toLowerCase().includes(query); // Filter by service
          }
          if (this.searchOption === 'user' && post.username) {
            return post.username.toLowerCase().includes(query); // Filter by user
          }
  
          return false;
        });
      },
  
      // Method to book the service
      async bookService(post) {
        if (!post.bookingDate) {
          alert("Please select a booking date.");
          return;
        }
  
        try {
          const response = await fetch(`${location.origin}/api/book_service`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token": this.$store.state.auth_token,
            },
            body: JSON.stringify({
              post_id: post.id,
              booking_date: post.bookingDate,
            }),
          });
  
          if (response.ok) {
            alert("Booking successful!");
            post.bookingDate = ''; // Optionally clear the date field after successful booking
          } else {
            const errorData = await response.json();
            alert(errorData.message || "Booking failed. Please try again.");
          }
        } catch (error) {
          console.error("Error booking service:", error);
        }
      },
      
    },
    computed: {
      minDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');  
        const day = String(today.getDate()).padStart(2, '0'); 
        return `${year}-${month}-${day}`; 
      },
      filteredPosts() {
        // Return filtered posts based on the selected search option and query
        return this.posts.filter(post => {
          const query = this.searchQuery.toLowerCase();
          if (this.searchOption === 'pincode' && post.pincode) {
            return post.pincode.toString().includes(query);
          }
          if (this.searchOption === 'service' && post.service) {
            return post.service.toLowerCase().includes(query);
          }
          if (this.searchOption === 'user' && post.username) {
            return post.username.toLowerCase().includes(query);
          }
          return true;
        });
      },
    }
  };
  