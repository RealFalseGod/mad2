import Post from "../components/Post.js";

export default {
    template: `
    <div class='p-4'>
        <h1>blogs list</h1>
        <Post v-for="post in posts" :service='post.service' :author_id='post.user_id' :post_id='post.id' />
    </div>
    `,

    data() {
        return {
            posts: [],
        };
    },

    methods: {},

    async mounted() {
        const res = await fetch(location.origin + "/api/posts", {
            headers: {
                "auth-token": this.$store.state.auth_token,
            },
        });

        this.posts = await res.json();
    },
    components: {
        Post,
    },
};