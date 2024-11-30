export default {
    template: `
    <div class="admin-dashboard">
    <h1 class="dashboard-title">Admin Dashboard</h1>
    <div class="button-container">
        <button @click="create_csv" class="btn btn-primary">Get Blogs Data</button>
        <button @click="$router.push('/admin-summary')" class="btn btn-secondary">View Summary</button>
        <button @click="$router.push('/admin-bookings')" class="btn btn-secondary">View Bookings</button>
    </div>
</div>
    `,

    methods: {
        async create_csv() {
            const res = await fetch(location.origin + '/createcsv');
            const task_id = (await res.json()).task_id;
            console.log(res.ok);
            console.log("hahhdahs");
            
            const interval = setInterval(async () => {
                const res = await fetch(location.origin + '/getcsv/' + task_id);
                if (res.ok){
                    console.log('csv created');
                    window.open(`${location.origin}/getcsv/${task_id}`)
                    clearInterval(interval);
                }
            },100)

        },
    }
}
