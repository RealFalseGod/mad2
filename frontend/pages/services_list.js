import Postcard from "../components/Postcard.js";

export default {
  template: `
    <div class='p-4'>
        <h1>Services List</h1>
        <Postcard 
            v-for="service in services" 
            :key="service.id" 
            :service='service.service' 
            :name='service.name' 
            :post_id='service.id'
            :author_id='service.user_id'
            @postDeleted="deletepost"
         />
    </div>
    `,

  data() {
    return {
      services: [],
    };
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
        this.services = this.services.filter(service => service.id !== post_id);
    }
  },

  async mounted() {
    await this.fetchServices();
  },
  components: {
    Postcard,
  },
};
