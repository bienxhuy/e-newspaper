import hbs_section from 'express-handlebars-sections';
import session from "express-session";
import express from "express";
import path from 'path';

import passport from './middlewares/passport.js';
import dotenv from 'dotenv';

import {engine} from "express-handlebars";
import {dirname} from "path";
import {fileURLToPath} from "url";

import helper from './utils/helper.js';
import { isAdmin, isAuth, isEditor, isWriter } from './middlewares/auth.mdw.js';

import accountRoute from "./routes/account.route.js";
import authRouter from './routes/auth.route.js';
import writerRouter from './routes/writer.route.js';
import categoryRoute from "./routes/category.route.js";
import articleRoute from "./routes/article.route.js";
import editorRouter from './routes/editor.route.js';
import commentRoute from './routes/commentRoute.js';
import adminRoute from "./routes/admin/admin.route.js";
import {getVipUser} from "./middlewares/user.mdw.js";


// =================================================
//                  SERVER CONFIG
// =================================================
dotenv.config();
const app = express();

app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'SECRET_KEY',
    resave: false,
    saveUninitialized: true,
    cookie: {}
}))

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Middleware Passport
app.use(passport.initialize());
app.use(passport.session());

app.use('/static', express.static('static'));
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use('/others', express.static(path.join(__dirname, '/static/images/others')));


app.engine('hbs', engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: './views/layouts',
    helpers: {
        formatSimpleDatetime: helper.formatSimpleDatetime,
        toUpperCase: helper.toUpperCase,
        section: hbs_section(),
        eq: helper.eq,
        greater: helper.greater,
        less: helper.less,
        range: helper.range,
        add: helper.add,
        subtract: helper.subtract,  
    },
}));

app.set("view engine", "hbs");
app.set("views", "./views");


// =================================================
//                  SERVER ROUTING
// =================================================

app.use('/', authRouter);
app.use('/', articleRoute);
app.use('/', commentRoute);
app.use('/account', isAuth, getVipUser, accountRoute);
app.use('/category', categoryRoute);
app.use('/writer', isAuth, isWriter, writerRouter);
app.use('/editor', isAuth, isEditor, editorRouter);
app.use('/admin', isAuth, isAdmin, adminRoute);


app.listen(3000, function () {
    console.log("Server started on port 3000");
});