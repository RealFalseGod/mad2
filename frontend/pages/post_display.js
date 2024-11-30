export default {

    props: ["id"],

    template: `
    <div class="post-view">
        <h1>Post View Page</h1>
        <br />
        <h2>{{ post.name }}</h2>
        <p>{{ post.content }}</p>
        <p>Price: ₹{{ post.price }}</p>

        <div v-if="$store.state.role === 'user'">
            <input 
                type="date" 
                v-model="booking_date" 
                class="form-control mb-3" 
                :min="minDate"
                placeholder="Select a date"
            />
            <button class="btn btn-primary" @click="bookservice">Book Service</button>
        </div>
    </div>
    
    `,
    data() {
        return {
            post: {},
            booking_date: "",
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
    },

    methods: {
        async bookservice() {
            const res = await fetch(`${location.origin}/api/book_service`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": this.$store.state.auth_token,
                },
                body: JSON.stringify({
                    post_id: this.id,
                    booking_date: this.booking_date,
                }),
            });
            if (res.ok) {
                alert("Service booked successfully");
            } else {
                const errorData = await res.json();
                alert(`${errorData.message || "Unknown error"}`);
            }
        },
            
    },
    computed: {
        minDate() {
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');  // Ensure two-digit month
          const day = String(today.getDate()).padStart(2, '0');  // Ensure two-digit day
          return `${year}-${month}-${day}`;  // Return in the format YYYY-MM-DD
        },
      }
    
}