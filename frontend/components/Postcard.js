export default {
    props: ["service", "post_id","name"],

    template: `
    <div class="jumbotron">
        <h1 @click='$router.push("/posts/"+ post_id)' >{{post_id}}. {{service}}</h1>
        <h2>{{name}}</h2>
        
               
        
    </div>
    
    `,
};
