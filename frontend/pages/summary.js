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
                        <th>Actions</th>
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
                        <td>
                            <button 
                                class="btn" 
                                :class="user.active ? 'btn-outline-danger' : 'btn-outline-success'" 
                                @click="toggleUserStatus(user.id)" 
                                data-bs-toggle="button"                            >
                                {{ user.active ? 'Ban' : 'Unban'  }}
                            </button>
                        </td>
                    </tr>
                </tbody>           
            </table>
        </div>
    `,

    data() {
        return {
            users: [],
        };
    },

    methods: {
        async toggleUserStatus(user_id) {
            const user = this.users.find(user => user.id === user_id);
            if (!user) return;

            const res = await fetch(location.origin + `/api/users/${user_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': this.$store.state.auth_token,
                },
                body: JSON.stringify({ active: !user.active }),
            });

            if (res.ok) {
                alert(`User ${user.active ? 'banned' : 'unbanned'} successfully!`);
                user.active = !user.active;
            } else {
                alert(`Error ${user.active ? 'banning' : 'unbanning'} user.`);
            }
        }
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