import Postcard from "../components/Postcard.js";

export default {
    template: `
    <div class='p-4'>
        <h1>Services List</h1>
        <Postcard v-for="service in services" :key="service.id" :service='service.service' :name='service.name' :post_id='service.id' />
    </div>
    `,

    data() {
        return {
            services: [],
        };
    },

    methods: {},

    async mounted() {
        const res = await fetch(location.origin + "/api/posts", {
            headers: {
                "auth-token": this.$store.state.auth_token,
            },
        });

        this.services = await res.json();
    },
    components: {
        Postcard,
    },
};