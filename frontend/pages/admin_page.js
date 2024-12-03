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
            try {
                // Start the process by sending a request to create the CSV
                const res = await fetch(location.origin + '/createcsv');
                
                if (!res.ok) {
                    throw new Error('Failed to start CSV creation');
                }
    
                const data = await res.json();
                const task_id = data.task_id;
    
                console.log('CSV creation started', task_id);
    
                // Set up polling to check if the CSV is ready
                const interval = setInterval(async () => {
                    try {
                        const res = await fetch(location.origin + '/getcsv/' + task_id);
                        
                        if (res.ok) {
                            console.log('CSV created');
                            window.open(`${location.origin}/getcsv/${task_id}`);
                            clearInterval(interval);
                        } else {
                            
                            console.error('Error fetching CSV:', res.status, res.statusText);
                            clearInterval(interval);
                        }
                    } catch (error) {
                        console.error('Error during CSV polling:', error);
                        clearInterval(interval); 
                    }
                }, 1000); 
    
            } catch (error) {
              
                console.error('Error during CSV creation process:', error);
                alert('There was an error creating the CSV file. Please try again later.');
            }
        },
    }
}
