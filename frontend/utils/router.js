const home = {
    template: `<h1>this is home from router js</h1>
    `,
};

import login from "../pages/login.js";
import register from "../pages/register.js";
import services_list from "../pages/services_list.js";
import post_display from "../pages/post_display.js";
import admin_page from "../pages/admin_page.js";
import store from "./store.js";


const routes = [
    { path: "/", component: home },
    { path: "/login", component: login },
    { path: "/register", component: register },
    { path: "/services", component: services_list, meta: { requiresAuth: true } },
    { path: "/posts/:id", component: post_display, props: true, meta: { requiresAuth: true } },
    { path: "/admin-dashboard", component: admin_page, meta: { requiresAuth: true, role : 'admin' } },


];

const router = new VueRouter({ routes });

// frontened navigation guards

router.beforeEach((to, from, next) => {
    // to and from are both route objects. must call `next`.
    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (!store.state.loggedin) {
            next({ path: "/login" })
        } else if (to.meta.role && to.meta.role != store.state.role) {
            alert("You are not authorized to access this page")
            next({ path: "/" })
        } else {
            next();
        }
    } else {
        next();
    }
});


export default router;