export default {
    props: ["service", "post_id", "name", "author_id"],

    template: `
    <div class="jumbotron">
        <h1 @click='$router.push("/posts/"+ post_id)' >{{post_id}}. {{service}}</h1>
        <h2>{{name}}</h2>
        <h2>{{author_id}}</h2>
        <button class="btn btn-danger" v-if='can_delete' @click='deletepost'>Delete Post</button>
        <button class="btn btn-outline-primary" v-if='can_delete' @click='$router.push("/edit-post/"+ post_id)'>Edit Post</button>
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
