export default {
    template: `
    <div class="posts-container">
    <h1 class="section-title">Authorized Posts</h1>
  
    <!-- Filter Options using select dropdown -->
    <div class="filter-container">
      <label for="postFilter" class="filter-label">Filter Posts: </label>
      <select id="postFilter" v-model="filter" class="filter-select">
        <option value="authorized">Show Authorized</option>
        <option value="unauthorized">Show Unauthorized</option>
      </select>
    </div>
  
    <!-- Display posts in a table -->
    <div v-if="filteredPosts.length === 0" class="no-posts-message">
      <p>No posts available.</p>
    </div>
  
    <div v-else>
      <table class="posts-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Service</th>
            <th>Content</th>
            <th>Price</th>
            <th>Authorized</th>
            <th>User ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in filteredPosts" :key="post.id" class="post-item">
            <td>{{ post.name }}</td>
            <td>{{ post.service }}</td>
            <td>{{ post.content }}</td>
            <td>{{ post.price }}</td>
            <td>{{ post.authorized === 1 ? 'Authorized' : 'Unauthorized' }}</td>
            <td>{{ post.user_id }}</td>
            <td>
              <!-- Authorization buttons -->
              <button v-if="post.authorized === 0" @click="authorizePost(post.id)" class="btn-approve">Authorize</button>
              <button v-if="post.authorized === 1" @click="unauthorizePost(post.id)" class="btn-revoke">Un-Authorize</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
    `,
    data() {
      return {
        posts: [],
        filter: 'authorized', 
      };
    },
    mounted() {
      
      this.fetchPosts();
    },
    computed: {
     
      filteredPosts() {
        if (this.filter === 'authorized') {
          return this.posts.filter(post => post.authorized === 1); 
        } else if (this.filter === 'unauthorized') {
          return this.posts.filter(post => post.authorized === 0);
        }
      },
    },
    methods: {
      async fetchPosts() {
        try {
          const res = await fetch(location.origin + '/api/get_authpostlist', {
            headers: {
              'Content-Type': 'application/json',
              'auth-token': this.$store.state.auth_token,
            },
          });
  
         
          const data = await res.json();
  
       
          this.posts = data;  
        } catch (error) {
          console.error("Error fetching posts:", error);
          alert("Failed to load posts.");
        }
      },
  
      // Handle authorization of a post
      async authorizePost(postId) {
        try {
          const res = await fetch(location.origin + `/api/authorize/${postId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'auth-token': this.$store.state.auth_token,
            },
          });
  
          if (res.ok) {
            // Find the post in the list and update its status to authorized
            const post = this.posts.find(p => p.id === postId);
            if (post) post.authorized = 1;
          } else {
            alert("Failed to authorize post.");
          }
        } catch (error) {
          console.error("Error authorizing post:", error);
          alert("Failed to authorize post.");
        }
      },
  
      // Handle un-authorization of a post
      async unauthorizePost(postId) {
        try {
          const res = await fetch(location.origin + `/api/unauthorize/${postId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'auth-token': this.$store.state.auth_token,
            },
          });
  
          if (res.ok) {
            // Find the post in the list and update its status to unauthorized
            const post = this.posts.find(p => p.id === postId);
            if (post) post.authorized = 0;
          } else {
            alert("Failed to un-authorize post.");
          }
        } catch (error) {
          console.error("Error un-authorizing post:", error);
          alert("Failed to un-authorize post.");
        }
      },
    },
  };
  