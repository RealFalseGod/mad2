export default {
    template: `
        <div>
            <h1>Admin Dashboard</h1>
            <button @click='create_csv' > get blogs data </button>
            <button @click='$router.push("/admin-summary")' class='btn btn-secondary'>View Summary</button>
            <button @click='$router.push("/admin-bookings")' class='btn btn-secondary'>View Bookings</button>

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
