const home = {
    template: `<h1>this is home from router js</h1>
    `,
};

import login from "../pages/login.js";

const routes = [
    { path: "/", component: home },
    { path: "/login", component: login },
    { path: "/register", component: home },
];

const router = new VueRouter({ routes });

export default router;