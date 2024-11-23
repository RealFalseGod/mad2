export default {

    props: ["id"],

    template: `
    <div>
        <h1>post view page</h1>  
        <p> {{this.id}} </p>
        <h2>{{post.service}}</h2>      
        <p>{{post.user_id}}</p>
        <p>{{post.content}}</p>
    </div>
    
    `,
    data() {
        return {
            post: {},
        };
    },

    async mounted() {
        const res = await fetch(`${location.origin}/api/posts/${this.id}`, {
            headers: {
                "auth-token": this.$store.state.auth_token,
            },
        })
        if (res.ok) {
            this.post = await res.json()
        }
    }
}
