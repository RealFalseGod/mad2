export default {

    template: `
    <div>
        <h1>blogs list</h1>
        <h2> {{$store.state.auth_token}} </h2>
        <h3 v-for='post in posts' > {{post.service}} </h3>
    </div>
    `,

    data() {
        return {
            posts: [],
        };
    },

    methods: {

    },

    async mounted() {
        const res = await fetch(location.origin + "/api/posts", {
            headers: {
                'auth-token': this.$store.state.auth_token
            }
        })

        this.posts = await res.json()
    },
};
