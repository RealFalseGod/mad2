import Postcard from "../components/Postcard.js";

export default {
    template: `
    <div class="container">
    <h1>Services List</h1>
    <input 
      type="text" 
      v-model="searchQuery" 
      placeholder="Search services..." 
      class="form-control mb-3" 
    />
    <div v-for="service in filteredServices" :key="service.id">
      <Postcard 
        :service="service.service" 
        :name="service.name" 
        :post_id="service.id" 
        :author_id="service.user_id" 
        :price="service.price"
        @postDeleted="deletepost"
      />
    </div>
  </div>
    `,

    data() {
        return {
            services: [],
            searchQuery: "",
        };
    },
    computed: {
        filteredServices() {
            return this.services.filter((service) =>
                service.service.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        },
    },

    methods: {
        async fetchServices() {
            const res = await fetch(location.origin + "/api/posts", {
                headers: {
                    "auth-token": this.$store.state.auth_token,
                },
            });
            this.services = await res.json();
        },

        deletepost(post_id) {
            // Filter out the deleted post from the services array
            this.services = this.services.filter((service) => service.id !== post_id);
        },
    },

    async mounted() {
        await this.fetchServices();
    },
    components: {
        Postcard,
    },
};
