
export default {

    template: `
        <div>
            
            <h1>Create Post</h1>
            <input placeholder='Name' v-model='name' />
            <input placeholder='Service' v-model='service' />
            <input placeholder='description' v-model='content' /> 
            <button  class='btn btn-primary' @click='createPost'>Create Post</button>  

        </div>    
    `,
    data() {
        return {
            name: '',
            content: '',
            service: '',
        }
    },
    methods: {
        async createPost() {
            const res = await fetch(location.origin + '/api/posts', {
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': this.$store.state.auth_token,
                },
                method: 'POST',
                body: JSON.stringify({
                    name: this.name,
                    content: this.content,
                    service: this.service,
                }),
            });
            if (res.ok) {
                alert("Post created successfully!");
                this.$router.push('/services');
            } else {
                alert("Post creation failed!");
            }
        }
    }
}
