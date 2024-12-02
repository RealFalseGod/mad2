export default {
    template: `
    <div>
    <div v-if="!$store.state.loggedin">
    <div class="containerh">
  <h1>Service Snap</h1>
</div>
    </div>
    <h1 v-if="userRole === 'admin'">Admin Dashboard</h1>
    <h1 v-if="userRole === 'staff'">Staff Dashboard</h1>
    <h1 v-if="userRole === 'user'">User Dashboard</h1>

    <div v-if="userRole === 'admin'" :style="{ width: '250px', height: '250px', margin: '0 auto', padding: '10px' }">
        <!-- Admin-specific content -->
        <p>Admin controls, analytics, user management, etc.</p>
        <div v-if="adminStats">
            <h2>Admin Stats:</h2>
            <!-- Existing chart -->
            <canvas id="pieChart" :style="{ width: '100%', height: '100%' }"></canvas>
            <!-- New Requests Breakdown chart -->
            <h2>Requests Breakdown:</h2>
            <canvas id="requestsChart" :style="{ width: '100%', height: '100%' }"></canvas>
            <h2>Review Stats:</h2>
            <p>Total Reviews: {{ adminStats.total_reviews_count }}</p>
            <p>Average Stars: {{ adminStats.average_rating }}</p>
            <ul>
                <li v-for="(review, index) in adminStats.recent_reviews" :key="index">

                    <strong>{{ review.user_id }}</strong>: {{ review.content }} 
                    <span> - {{ review.star }} Stars</span>
                </li>
            </ul>
            <h2>Top 3 Staff Members:</h2>
            <ul>
                <li v-for="(staff, index) in adminStats.top_3_staff_by_reviews
" :key="index">
                    {{ index + 1 }}. {{ staff.username }} - {{ staff.star }} Points
                </li>
            </ul>
        </div>
    </div>

    <div v-if="userRole === 'staff'">
    <!-- Staff-specific content -->
    <p>Staff controls, service bookings, post management, etc.</p>

    <!-- Total Jobs Done -->
    <div>
        <h3>Total Jobs Done</h3>
        <p>{{ staffstats.total_jobs_done }}</p>
    </div>
    <div>
        <h3>Rating</h3>
        <p>{{ staffstats.rating }}</p>
    </div>

    <!-- Total Jobs To Do -->
    <div>
        <h3>Total Jobs To Do</h3>
        <p>{{ staffstats.total_jobs_to_do }}</p>
    </div>

    <!-- Total Jobs Requests -->
    <div>
        <h3>Total Jobs Requests</h3>
        <p>{{ staffstats.total_jobs_requests }}</p>
    </div>

    <!-- Rating -->
    

    <!-- Recent Reviews -->
    <div>
        <h3>Recent Reviews</h3>
        <ul>
            <li v-for="(review, index) in staffstats.recent_reviews" :key="index">
                <strong>Post ID:</strong> {{ review.post_id }} | 
                <strong>Star Rating:</strong> {{ review.star }} | 
                <strong>Review:</strong> {{ review.content }}
            </li>
        </ul>
    </div>

</div>

<div v-if="userRole === 'user'">
<!-- User-specific content -->
<h2>User Dashboard</h2>
<p>Welcome to your profile! Here are your stats:</p>

<!-- Total Jobs Done -->
<div>
    <h3>Total Jobs Done</h3>
    <p>{{ userstats.total_jobs_done }}</p>
</div>

<!-- Total Jobs Pending -->
<div>
    <h3>Total Jobs Pending</h3>
    <p>{{ userstats.total_jobs_pending }}</p>
</div>

<!-- Jobs Rejected This Month -->
<div>
    <h3>Jobs Rejected This Month</h3>
    <p>{{ userstats.jobs_rejected_this_month }}</p>
</div>

<!-- Last Two Reviews -->
<div>
    <h3>Last Two Reviews</h3>
    <ul v-if="userstats.last_two_reviews && userstats.last_two_reviews.length">
        <li v-for="(review, index) in userstats.last_two_reviews" :key="index">
            <strong>Post_id ID:</strong> {{ review.post_id }} <br>
            <strong>Rating:</strong> {{ review.star }} Stars <br>
            <strong>Comment:</strong> {{ review.content }} <br>
        </li>
    </ul>
    <p v-else>No reviews available.</p>
</div>
</div>
</div>
    `,
    data() {
        return {
            userRole: '', // This will hold the role of the current user (admin, staff, or user)
            adminStats: null, // Holds the admin statistics
            staffstats: null,
            userstats: null,
            
        };
    },
    mounted() {
        this.fetchUserRole();
        switch (this.userRole) {
            case 'admin':
                this.get_adminstats();
                break;
            case 'staff':
                this.get_staffstats();
                break;
            case 'user':
                this.get_userstats();
                break;
        }
    },
    methods: {
        fetchUserRole() {
            this.userRole = this.$store.state.role; // Example: Using Vuex store to get user role
        },
        async get_adminstats() {
            try {
                const res = await fetch(location.origin + '/api/get_admin_stat', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': this.$store.state.auth_token,
                    }
                });
                const d = await res.json();
                console.log(d)
                if (res.ok) {
                    this.adminStats = d;
                    this.$nextTick(() => {
                        this.renderPieChart();  // Render existing chart
                        this.renderRequestsChart();  // Render new chart
                    });
                } else {
                    console.error('Error fetching admin stats:', d.message);
                }
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            }
        },
        async get_staffstats() {
            try {
                const res = await fetch(location.origin + '/api/get_staff_stat', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': this.$store.state.auth_token,
                    }
                });
                const d = await res.json();
                console.log(d)
                if (res.ok) {
                    this.staffstats = d;
                    
                } else {
                    console.error('Error fetching staff stats:', d.message);
                }
            } catch (error) {
                console.error('Error fetching staff stats:', error);
            }
        },
        async get_userstats() {
            try {
                const res = await fetch(location.origin + '/api/get_user_stat', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': this.$store.state.auth_token,
                    }
                });
                const d = await res.json();
                console.log(d)
                if (res.ok) {
                    this.userstats = d;
                   
                } else {
                    console.error('Error fetching staff stats:', d.message);
                }
            } catch (error) {
                console.error('Error fetching staff stats:', error);
            }
        },
        renderPieChart() {
            if (this.adminStats) {
                const ctx = document.getElementById('pieChart').getContext('2d');
                new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: ['Staff Users', 'Regular Users', 'Total Active Users'],
                        datasets: [{
                            label: 'User Stats',
                            data: [
                                this.adminStats.staff_users,
                                this.adminStats.regular_users,
                                this.adminStats.total_active_users
                            ],
                            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                            hoverBackgroundColor: ['#FF4371', '#3590D6', '#FFD100'],
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(tooltipItem) {
                                        return tooltipItem.label + ': ' + tooltipItem.raw;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        },
        renderRequestsChart() {
            if (this.adminStats) {
                const ctx = document.getElementById('requestsChart').getContext('2d');
                new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: [
                            'Total Requests This Month',
                            'Expired Requests This Month',
                            'Completed Jobs This Month',
                            'Pending Jobs This Month'
                        ],
                        datasets: [{
                            label: 'Requests Breakdown',
                            data: [
                                this.adminStats.total_requests_this_month,
                                this.adminStats.total_requests_expired_this_month,
                                this.adminStats.total_jobs_this_month,
                                this.adminStats.total_pending_this_month
                            ],
                            backgroundColor: ['#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'],
                            hoverBackgroundColor: ['#36B3A5', '#FF4371', '#3590D6', '#FFD100'],
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(tooltipItem) {
                                        return tooltipItem.label + ': ' + tooltipItem.raw;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }
    }
};
