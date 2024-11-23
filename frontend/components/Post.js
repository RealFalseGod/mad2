export default {
    props: ["service", "author_id", "post_id"],

    template: `
    <div class="jumbotron">
        <h1 @click='$router.push("/posts/"+ post_id)' >{{service}}</h1>
        <p> {{post_id}} </p>
        <p> {{author_id}} </p>        
        
    </div>
    
    `,
};
