export default {
    template: `
    <div class="user-posts-container">
    <h1 class="user-posts-title">Your Posts</h1>

    <!-- Loading state -->
    <div v-if="isLoading" class="user-posts-loading">
        <p>Loading...</p>
    </div>

    <!-- No posts available -->
    <div v-else>
        <div v-if="posts.length === 0" class="user-posts-empty">
            <p>No posts available.</p>
        </div>

        <!-- Posts list -->
        <div v-else class="user-posts-list">
            <div v-for="post in posts" :key="post.id" class="user-post-item">
                <h3 class="user-post-title">{{ post.name }}</h3>
                <p class="user-post-detail"><strong>Service:</strong> {{ post.service }}</p>
                <p class="user-post-detail"><strong>Description:</strong> {{ post.content }}</p>
                <p class="user-post-detail"><strong>Price:</strong> {{ post.price }}</p>

                <!-- Authorization status -->
                <p class="user-post-status"><strong>Status:</strong> {{ post.authorized === 1 ? 'Authorized' : 'Unauthorized' }}</p>

                <!-- Edit and Delete buttons -->
                <button @click="editPost(post.id)" class="btn-edit">Edit</button>
                <button @click="deletePost(post.id)" class="btn-delete">Delete</button>
            </div>
        </div>
    </div>
</div>

    `,
    data() {
        return {
            posts: [],         // Stores fetched posts
            isLoading: true,   // Tracks loading state
        };
    },
    mounted() {
        this.fetchPosts();  
    },
    methods: {
        async fetchPosts() {
            try {
                const response = await fetch(`${location.origin}/api/get_postlist`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': this.$store.state.auth_token 
                    }
                });

                if (response.ok) {
                    this.posts = await response.json();  
                } else {
                    console.error(`Error fetching posts: ${response.statusText}`);
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                this.isLoading = false;  // Set loading to false when data is fetched
            }
        },

        // Method to handle post editing
        editPost(postId) {
            
            console.log('Navigating to edit post with ID:', postId)
            this.$router.push({ path: `/edit-post/${postId}` });
            console.log(`/edit-post/${postId}` )
        },

        // Method to handle post deletion
        async deletePost(postId) {
            if (confirm("Are you sure you want to delete this post?")) {
                try {
                    const response = await fetch(`${location.origin}/api/posts/${postId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'auth-token': this.$store.state.auth_token 
                        }
                    });

                    if (response.ok) {
                    
                        this.posts = this.posts.filter(post => post.id !== postId);
                    } else {
                        const errorData = await response.json();
                        console.error(`Error deleting post: ${response.statusText}`);
                        alert(errorData.message)
                    }
                } catch (error) {
                    console.error("Error deleting post:", error);
                }
            }
        }
    }
};
