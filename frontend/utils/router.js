const home = {
    template: `<h1>this is home from router js</h1>
    `,
};

import login from "../pages/login.js";
import register from "../pages/register.js";
import services_list from "../pages/services_list.js";
import post_display from "../pages/post_display.js";

const routes = [
    { path: "/", component: home },
    { path: "/login", component: login },
    { path: "/register", component: register },
    { path: "/services", component: services_list },
    { path: "/posts/:id", component: post_display , props: true},

];

const router = new VueRouter({ routes });

export default router;