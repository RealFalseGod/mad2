const home = {
    template: `<h1>this is home from router js</h1>
    `,
};

import login from "../pages/login.js";
import register from "../pages/register.js";

const routes = [
    { path: "/", component: home },
    { path: "/login", component: login },
    { path: "/register", component: register },
];

const router = new VueRouter({ routes });

export default router;