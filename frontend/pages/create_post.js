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
                    :class="{'is-invalid': name === '' && submitted}"
                    required
                />
                <div v-if="name === '' && submitted" class="invalid-feedback">Name is required.</div>
            </div>
            <div class="form-group">
                <input 
                    type="text" 
                    placeholder="Service" 
                    v-model="service" 
                    class="form-control" 
                    :class="{'is-invalid': service === '' && submitted}"
                    required
                />
                <div v-if="service === '' && submitted" class="invalid-feedback">Service is required.</div>
            </div>
            <div class="form-group">
                <textarea 
                    placeholder="Description" 
                    v-model="content" 
                    class="form-control" 
                    rows="4"
                    :class="{'is-invalid': content === '' && submitted}"
                    required
                ></textarea>
                <div v-if="content === '' && submitted" class="invalid-feedback">Description is required.</div>
            </div>
            <div class="form-group">
                <input 
                    type="number" 
                    placeholder="Price" 
                    v-model="price" 
                    step="1" 
                    class="form-control" 
                    :class="{'is-invalid': price <= 0 && submitted}"
                    required
                />
                <div v-if="price <= 0 && submitted" class="invalid-feedback">Price must be greater than zero.</div>
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
            price: 0,
            submitted: false,
        };
    },
    methods: {
        async createPost() {
            this.submitted = true; 

            // Check if any field is empty
            if (!this.name || !this.service || !this.content || this.price <= 0) {
                return; 
            }

            try {
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
                });

                if (res.ok) {
                    alert('Post created successfully!');
                    this.$router.push('/');
                } else {
                    const errorData = await res.json(); 
                    alert(errorData.message || 'An unexpected error occurred'); 
                }
            } catch (error) {
              
                alert('Error: ' + (error.message || 'An unexpected error occurred'));
            }
        }
    }
}
