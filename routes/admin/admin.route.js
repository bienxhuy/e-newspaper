import express from "express";
import adminArticlesRoute from "./admin-articles.route.js";
import adminCategoriesRoute from "./admin-categories.route.js";
import adminTagsRoute from "./admin-tags.route.js";
import adminUsersRoute from "./admin-users.route.js";
import adminRoleRegistersRoute from "./admin-role-register.route.js";
import adminVipUsersRoute from "./admin-vip-users.route.js";
import adminEditorCategoryRoute from "./admin-editor-category.route.js";

const router = express.Router();

router.use('/articles', adminArticlesRoute);

router.use('/categories', adminCategoriesRoute);

router.use('/tags', adminTagsRoute);

router.use('/role-registers', adminRoleRegistersRoute);

router.use('/vip-users', adminVipUsersRoute);

router.use('/users', adminUsersRoute);

router.use('/editor-category', adminEditorCategoryRoute);



router.get('/', function (req, res) {
    res.render('vwAdmin/dashboard', {
        layout: 'admin',
        dashboard: true,

    });
});


router.get('/articles', function (req, res) {
    res.render('vwAdmin/articles-menu', {
        layout: 'admin',
        articles: true,
    });
});

router.get('/users', function (req, res) {
    res.render('vwAdmin/users/users-menu', {
        layout: 'admin',
        users: true,
    });
});

router.get('/role-registers', function (req, res) {
    res.render('vwAdmin/role-register-menu', {
        layout: 'admin',
        role: true,
    });
});

export default router;