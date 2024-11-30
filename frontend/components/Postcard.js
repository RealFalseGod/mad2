export default {
    props: ["service", "post_id", "name", "author_id", "price"],

    template: `
    <div class="post-card">
    <h1 @click="$router.push('/posts/' + post_id)" class="post-title">
      {{ post_id }}. {{ service }}
    </h1>
    <h2 class="post-name">{{ name }}</h2>
    <div class="post-actions">
      <button 
        class="btn btn-danger" 
        v-if="can_delete" 
        @click="deletepost">
        Delete Post
      </button>
      <button 
        class="btn btn-outline-primary" 
        v-if="can_delete" 
        @click="$router.push('/edit-post/' + post_id)">
        Edit Post
      </button>
    </div>
  </div>
    
    `,
    computed: {
        can_delete() {
            return this.$store.state.role === 'admin' || (this.$store.state.user_id === this.author_id);
        }
    },
    methods: {
        async deletepost() {
            const res = await fetch(location.origin + '/api/posts/' + this.post_id, {
                method: 'DELETE',
                headers: {
                    'auth-token': this.$store.state.auth_token,
                }
            });
            if (res.ok) {
                alert("Post deleted successfully!");
                this.$emit('postDeleted', this.post_id); // Emit an event to notify parent component

            } else {
                alert("Post deletion failed!");
            }
        }
    }

}
