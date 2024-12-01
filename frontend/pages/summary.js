export default {
    template: `
    <div class="p-4">
        <!-- Dropdown to select user type -->
        <div class="mb-3">
            <label for="userType" class="form-label">Select User Type</label>
            <select v-model="selectedUserType" class="form-select" id="userType" @change="filterUsers">
                <option value="all">All Users</option>
                <option value="staff">Staff</option>
                <option value="user">User</option>
            </select>
        </div>

        <!-- Search Bar for filtering users by username -->
        <div class="mb-3">
            <label for="search" class="form-label">Search by Username</label>
            <input 
                v-model="searchQuery" 
                class="form-control" 
                id="search" 
                type="text" 
                placeholder="Search for a username" 
                @input="filterUsers"
            />
        </div>
        
        <!-- Table of users -->
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
                <tr v-for="user in filteredUsers" :key="user.id">
                    <td>{{ user.id }}</td>
                    <td @click="$router.push('/info/' + user.id)">{{ user.username }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.address }}</td>
                    <td>{{ user.pincode }}</td>
                    <td>{{ user.roles[0] }}</td>
                    <td>
                        <button 
                            class="btn" 
                            :class="user.active ? 'btn-outline-danger' : 'btn-outline-success'" 
                            @click="toggleUserStatus(user.id)" 
                            data-bs-toggle="button">
                            {{ user.active ? 'Ban' : 'Unban' }}
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    `,

    data() {
        return {
            users: [], // All users fetched from the API
            filteredUsers: [], // Users filtered based on selected type
            selectedUserType: 'all', // Default to showing all users
            searchQuery: '',
        };
    },

    methods: {
        async toggleUserStatus(user_id) {
            const user = this.users.find(user => user.id === user_id);
            if (!user) return;
            console.log(location.origin + `/api/users/${user_id}`);
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
        },

        filterUsers() {
            // Filter the users based on selected type
            let filtered = this.users;
            if (this.selectedUserType !== 'all') {
                filtered = filtered.filter(user => user.roles.includes(this.selectedUserType));
            }

            if (this.searchQuery) {
                filtered = filtered.filter(user => user.username.toLowerCase().includes(this.searchQuery.toLowerCase()));
            }
            this.filteredUsers = filtered;
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
            this.filterUsers(); // Filter users based on the default selected type
        }
    },
};
