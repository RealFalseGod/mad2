export default {

    template: `
    <div>
        <h1>Services</h1>
        <ul>
            <li v-for="service in services" :key="service">
                <h2>{{service}}</h2>
                <button @click="bookService(service)">Book</button>
            </li>
        </ul>
    </div>
    `,
    data() {
        return {
            services: [],
        };
    },
    async mounted() {
        const res = await fetch(location.origin + "/services", {
            headers: { "Content-Type": "application/json" },
            method: "GET",
        });
        if (res.ok) {
            const data = await res.json();
            this.services = data;
        }
    },
    methods: {
        async bookService(service) {
            const res = await fetch(location.origin + "/book_service", {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service: service,
                }),
                method: "POST",
            });
            if (res.ok) {
                console.log("service booked");
            }
        },
    },


};
