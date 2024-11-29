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
import create_post from "../pages/create_post.js";
import edit_post from "../pages/edit_post.js";
import summary from "../pages/summary.js";
import bookings from "../pages/bookings.js";


const routes = [
    { path: "/", component: home },
    { path: "/login", component: login },
    { path: "/register", component: register },
    { path: "/services", component: services_list, meta: { requiresAuth: true } },
    { path: "/posts/:id", component: post_display, props: true, meta: { requiresAuth: true } },
    { path: "/admin-dashboard", component: admin_page, meta: { requiresAuth: true, role : 'admin' } },
    { path: "/create-post", component: create_post, meta: { requiresAuth: true, role : 'staff' } },
    { path: "/edit-post/:id", component: edit_post, props: true, meta: { requiresAuth: true, role : 'staff' } },
    { path: "/admin-summary", component: summary, meta: { requiresAuth: true, role : 'admin' } },
    { path: "/admin-bookings", component: bookings, meta: { requiresAuth: true, role : 'admin' } },


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