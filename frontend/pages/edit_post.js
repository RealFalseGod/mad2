export default {
    props: ["id"],
    template: `
        <div>
            
            <h1>Create Post</h1>
            <input placeholder='Name' v-model='name' />
            <input placeholder='Service' v-model='service' />
            <input placeholder='description' v-model='content' /> 
            <input type="number" placeholder='Price' v-model='price' step="1" />
            <button  class='btn btn-primary' @click='editpost'>Edit Post</button>  

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
                this.$router.push('/services');
            } else {
                alert("Post edit failed!");
            }
        }
    },
}