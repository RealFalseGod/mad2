export default {
    props: ["service", "author_id"],

    template: `
    <div class="jumbotron">
        <h1>{{service}}</h1>
        <p> {{author_id}} </p>

    </div>
    
    `,
    data() {
        return {
            posts: [],
        };
    },
};
