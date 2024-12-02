export default {
    props: ["id"],
    template: `
    <div class="edit-post-container dark-theme">
    <h1>Edit Post</h1>
    <div class="form-group">
        <input 
            type="text" 
            placeholder="Name" 
            v-model="name" 
            class="form-control"
        />
    </div>
    <div class="form-group">
        <input 
            type="text" 
            placeholder="Service" 
            v-model="service" 
            class="form-control"
        />
    </div>
    <div class="form-group">
        <textarea 
            placeholder="Description" 
            v-model="content" 
            class="form-control" 
            rows="4">
        </textarea>
    </div>
    <div class="form-group">
        <input 
            type="number" 
            placeholder="Price" 
            v-model="price" 
            step="1" 
            class="form-control"
        />
    </div>
    <button 
        class="btn btn-primary edit-post-btn" 
        @click="editpost">
        Edit Post
    </button>
</div>   
    `,
    data() {
        return {
            name: '',
            content: '',
            service: '',
            price: 0,
        }
    },
    async mounted() {
        // Fetch the post details from the backend and change it
        const res = await fetch(`${location.origin}/api/posts/${this.id}`, {
            headers: {
                "auth-token": this.$store.state.auth_token,
            },
        });
        if (res.ok) {
            // Parse the response as JSON
            const post = await res.json();
            // Assign the post details to the component's data properties
            this.name = post.name;
            this.service = post.service;
            this.content = post.content;
            this.price = post.price;
        }
    },
    methods: {
        async editpost() {
            // upload edited data to the backend to edit the post
            const res = await fetch(location.origin + '/api/posts/' + this.id, {
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': this.$store.state.auth_token,
                },
                method: 'PUT',
                body: JSON.stringify({
                    name: this.name,
                    content: this.content,
                    service: this.service,
                    price: this.price,
                }),
            });
            if (res.ok) {
                alert("Post edited successfully!");
                this.$router.push('/posts');
                
            } else {
                alert("Post edit failed!");
            }
        }
    },
}