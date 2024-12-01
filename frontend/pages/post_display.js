export default {
    template: `
    <div class="post-list-container dark-theme">
        <h1>Your Posts</h1>

        <div v-if="isLoading">
            <p>Loading...</p>
        </div>

        <div v-else>
            <div v-if="posts.length === 0">
                <p>No posts available.</p>
            </div>

            <div v-else>
                <div v-for="post in posts" :key="post.id" class="post-item">
                    <h3>{{ post.name }}</h3>
                    <p><strong>Service:</strong> {{ post.service }}</p>
                    <p><strong>Description:</strong> {{ post.content }}</p>
                    <p><strong>Price:</strong> {{ post.price }}</p>
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
        this.fetchPosts();  // Fetch posts when the component is mounted
    },
    methods: {
        async fetchPosts() {
            try {
                const response = await fetch(`${location.origin}/api/get_postlist`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': this.$store.state.auth_token // Assuming the token is stored in Vuex
                    }
                });

                if (response.ok) {
                    this.posts = await response.json();  // Assign fetched posts to the posts array
                } else {
                    console.error(`Error fetching posts: ${response.statusText}`);
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                this.isLoading = false;  // Set loading to false when data is fetched
            }
        }
    }
};
