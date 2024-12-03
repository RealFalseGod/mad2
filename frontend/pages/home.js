export default {
  template: `
  <div>
  <div v-if="!$store.state.loggedin">
      <div class="containerh">
          <h1>Service Snap</h1>
      </div>
  </div>
  <div class="admin-dashboard-header">
      <h1 v-if="userRole === 'admin'" style="text-align: center;">Admin Dashboard</h1>
  </div>
  <!-- Admin Content -->
  <div v-if="userRole === 'admin'" >
      <div v-if="adminStats">
          <div class="review-stats-container">
          <h2>Total Reviews: {{ adminStats.total_reviews_count }} Average Stars: {{ formatAverageRating(adminStats.average_rating) }}</h2>

          </div>
          <div class="charts-container">
              <div class="chart-section">
                  <h2>Active users</h2>
                  <canvas id="pieChart" class="chart"></canvas>
              </div>
              <div class="chart-section">
                  <h2>Requests Breakdown</h2>
                  <canvas id="requestsChart" class="chart"></canvas>
              </div>
          </div>
          <section class="recent-reviews-section">
              <h3>Recent Reviews</h3>
              <table class="recent-reviews-table">
                  <thead>
                      <tr>
                          <th>User ID</th>
                          <th>Review Content</th>
                          <th>Stars</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="(review, index) in adminStats.recent_reviews" :key="index">
                          <td>{{ review.user_id }}</td>
                          <td>{{ review.content }}</td>
                          <td>{{ review.star }} Stars</td>
                      </tr>
                  </tbody>
              </table>
          </section>
          <section class="top-staff-section">
              <h3>Top 3 Staff Members</h3>
              <table class="top-staff-table">
                  <thead>
                      <tr>
                          <th>Rank</th>
                          <th>Username</th>
                          <th>Stars</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="(staff, index) in adminStats.top_3_staff_by_reviews" :key="index">
                          <td>{{ index + 1 }}</td>
                          <td>{{ staff.username }}</td>
                          <td>{{ staff.star }}</td>
                      </tr>
                  </tbody>
              </table>
          </section>
      </div>
  </div>

  <!-- Staff Content -->
  <div v-if="userRole === 'staff'" class="staff-dashboard">
    <h2>Staff Dashboard</h2>

    <!-- Stats Section -->
    <div class="stats-row">
        <div class="stat-item">
            <h3>Total Jobs Done</h3>
            <p>{{ staffstats.total_jobs_done }}</p>
        </div>
        <div class="stat-item">
            <h3>Rating</h3>
            <p>{{ staffstats.rating }}</p>
        </div>
        <div class="stat-item">
            <h3>Total Jobs To Do</h3>
            <p>{{ staffstats.total_jobs_to_do }}</p>
        </div>
        <div class="stat-item">
            <h3>Total Jobs Requests</h3>
            <p>{{ staffstats.total_jobs_requests }}</p>
        </div>
    </div>

    <!-- Recent Reviews Section -->
    <div class="recent-reviews">
        <h3>Recent Reviews</h3>
        <table class="reviews-table">
            <thead>
                <tr>
                    <th>Post ID</th>
                    <th>Star Rating</th>
                    <th>Review</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(review, index) in staffstats.recent_reviews" :key="index">
                    <td>{{ review.post_id }}</td>
                    <td>{{ review.star }}</td>
                    <td>{{ review.content }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

  <!-- User Content -->
  <div v-if="userRole === 'user'" class="user-dashboard">
    <h2>User Dashboard</h2>

    <!-- Stats Section -->
    <div class="stats-row">
        <div class="stat-item">
            <h3>Total Jobs Done</h3>
            <p>{{ userstats.total_jobs_done }}</p>
        </div>
        <div class="stat-item">
            <h3>Total Jobs Pending</h3>
            <p>{{ userstats.total_jobs_pending }}</p>
        </div>
        <div class="stat-item">
            <h3>Jobs Rejected This Month</h3>
            <p>{{ userstats.jobs_rejected_this_month }}</p>
        </div>
    </div>

    <!-- Last Two Reviews Section -->
    <div class="recent-reviews">
        <h3>Last Two Reviews</h3>
        <table class="reviews-table">
            <thead>
                <tr>
                    <th>Post ID</th>
                    <th>Rating</th>
                    <th>Comment</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(review, index) in userstats.last_two_reviews" :key="index">
                    <td>{{ review.post_id }}</td>
                    <td>{{ review.star }} Stars</td>
                    <td>{{ review.content }}</td>
                </tr>
                <tr v-if="!(userstats.last_two_reviews && userstats.last_two_reviews.length)">
                    <td colspan="3" style="text-align: center;">No reviews available</td>
                </tr>
            </tbody>
        </table>
    </div>

</div>
  `,
  data() {
    return {
      userRole: '', // This will hold the role of the current user (admin, staff, or user)
      adminStats: null, // Holds the admin statistics
      staffstats: null,
      userstats: null
    }
  },
  mounted() {
    this.fetchUserRole()
    switch (this.userRole) {
      case 'admin':
        this.get_adminstats()
        break
      case 'staff':
        this.get_staffstats()
        break
      case 'user':
        this.get_userstats()
        break
    }
  },
  methods: {
    fetchUserRole() {
      this.userRole = this.$store.state.role // Example: Using Vuex store to get user role
    },
    formatAverageRating(rating) {
      return parseFloat(rating).toFixed(2);
  }
    ,
    async get_adminstats() {
      try {
        const res = await fetch(location.origin + '/api/get_admin_stat', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': this.$store.state.auth_token
          }
        })
        const d = await res.json()
        console.log(d)
        if (res.ok) {
          this.adminStats = d
          this.$nextTick(() => {
            this.renderPieChart() // Render existing chart
            this.renderRequestsChart() // Render new chart
          })
        } else {
          console.error('Error fetching admin stats:', d.message)
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error)
      }
    },
    async get_staffstats() {
      try {
        const res = await fetch(location.origin + '/api/get_staff_stat', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': this.$store.state.auth_token
          }
        })
        const d = await res.json()
        console.log(d)
        if (res.ok) {
          this.staffstats = d
        } else {
          console.error('Error fetching staff stats:', d.message)
        }
      } catch (error) {
        console.error('Error fetching staff stats:', error)
      }
    },
    async get_userstats() {
      try {
        const res = await fetch(location.origin + '/api/get_user_stat', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': this.$store.state.auth_token
          }
        })
        const d = await res.json()
        console.log(d)
        if (res.ok) {
          this.userstats = d
        } else {
          console.error('Error fetching staff stats:', d.message)
        }
      } catch (error) {
        console.error('Error fetching staff stats:', error)
      }
    },
    renderPieChart() {
      if (this.adminStats) {
        const ctx = document.getElementById('pieChart').getContext('2d')
        new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Staff Users', 'Regular Users', 'Total Active Users'],
            datasets: [
              {
                label: 'User Stats',
                data: [
                  this.adminStats.staff_users,
                  this.adminStats.regular_users,
                  this.adminStats.total_active_users
                ],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                hoverBackgroundColor: ['#FF4371', '#3590D6', '#FFD100']
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top'
              },
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    return tooltipItem.label + ': ' + tooltipItem.raw
                  }
                }
              }
            }
          }
        })
      }
    },
    renderRequestsChart() {
      if (this.adminStats) {
        const ctx = document.getElementById('requestsChart').getContext('2d')
        new Chart(ctx, {
          type: 'pie',
          data: {
            labels: [
              'Total Requests This Month',
              'Expired Requests This Month',
              'Completed Jobs This Month',
              'Pending Jobs This Month'
            ],
            datasets: [
              {
                label: 'Requests Breakdown',
                data: [
                  this.adminStats.total_requests_this_month,
                  this.adminStats.total_requests_expired_this_month,
                  this.adminStats.total_jobs_this_month,
                  this.adminStats.total_pending_this_month
                ],
                backgroundColor: ['#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'],
                hoverBackgroundColor: [
                  '#36B3A5',
                  '#FF4371',
                  '#3590D6',
                  '#FFD100'
                ]
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top'
              },
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    return tooltipItem.label + ': ' + tooltipItem.raw
                  }
                }
              }
            }
          }
        })
      }
    }
  }
}
