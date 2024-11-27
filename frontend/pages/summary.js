export default {
    template: `
        <div class='p-4'>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Pincode</th>
                        <th>Roles</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id">
                        <td>{{user.id}}</td>
                        <td>{{user.username}}</td>
                        <td>{{user.email}}</td>
                        <td>{{user.address}}</td>
                        <td>{{user.pincode}}</td>
                        <td>{{user.roles[0]}}</td>
                    </tr>
                </tbody            
            </table>
        </div>
    `,

    data() {
        return {
            users: [],
        };
    },

    async mounted() {
        const res = await fetch(location.origin + "/api/users", {
            headers: {
                "auth-token": this.$store.state.auth_token,
            },
        });
        if (!res.ok) {
            alert("You are not authorized to view this page!");
            this.$router.push("/login");
        } else {
            this.users = await res.json();
        }
    },
}