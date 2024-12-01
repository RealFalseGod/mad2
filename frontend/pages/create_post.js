export default {
    template: `
    <div class="create-post-container dark-theme">
            <h1>Create Post</h1>
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
                class="btn btn-primary create-post-btn" 
                @click="createPost">
                Create Post
            </button>
        </div> 
    `,
    data() {
        return {
            name: '',
            content: '',
            service: '',
            price: 0
        }
    },
    methods: {
        async createPost() {
            const res = await fetch(location.origin + '/api/posts', {
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': this.$store.state.auth_token
                },
                method: 'POST',
                body: JSON.stringify({
                    name: this.name,
                    content: this.content,
                    service: this.service,
                    price: this.price
                })
            })
            if (res.ok) {
                alert('Post created successfully!')
                this.$router.push('/services')
            } else {
                alert('Post creation failed!')
            }
        }
    }
}
