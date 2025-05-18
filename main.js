import hbs_section from 'express-handlebars-sections';
import session from "express-session";
import express from "express";
import path from 'path';

import passport from './middlewares/passport.js';
import dotenv from 'dotenv';

import { engine } from "express-handlebars";
import { dirname } from "path";
import { fileURLToPath } from "url";

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
import { getVipUser } from "./middlewares/user.mdw.js";

import csrf from 'csurf';
import helmet from 'helmet';
import crypto from 'crypto';
import https from 'https';
import fs from 'fs';


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
    cookie: {
        sameSite: 'lax',
        secure: true
    }
}))

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Middleware Passport
app.use(passport.initialize());
app.use(passport.session());

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
// Server Leaks Information via "X-Powered-By" HTTP Response Header Field(s)
// =================================================
app.disable('x-powered-by');


// =================================================
//                  CSRF CONFIGURATION
// =================================================
// Enable CSRF protection
const csrfProtection = csrf();

app.use(csrfProtection);

// Make csrfToken available to all views
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Additionally configure response when csrf token is invalid
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        // Session has expired or tampered with
        res.status(403);
        res.send('Invalid CSRF token.');
    } else {
        next(err);
    }
});


// =================================================
//             HTTP HEADER CONFIGURATION
// =================================================
// Generate a random nonce value
app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString('base64');
    next();
});

// Define policy in middleware
app.use((req, res, next) => {
    const nonce = res.locals.nonce;

    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "https://cdn.jsdelivr.net",
                "https://code.jquery.com",
                "https://ajax.googleapis.com",
                "https://cdnjs.cloudflare.com",
                "https://cdn.tiny.cloud",
                "https://twitter.github.io",
                "https://www.google.com",
                "https://www.gstatic.com",
                `'nonce-${nonce}'`
            ],
            styleSrc: [
                "'self'",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com",
                "https://fonts.googleapis.com",
                `'nonce-${nonce}'`,
                "'sha256-2hfpHa9d2z5yTDzk/TaGjE7b0lSfdRgpgDc1XofiLTg='",
                "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='"
            ],
            fontSrc: [
                "'self'",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com",
                "https://fonts.gstatic.com"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "https://sp.tinymce.com"
            ],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameSrc: [
                "'self'",
                "https://www.google.com/",
                "https://cdn.tiny.cloud"
            ],
            frameAncestors: ["'none'"],
            formAction: ["'self'"],
            baseUri: ["'self'"],
            mediaSrc: ["'none'"],
            manifestSrc: ["'self'"],
            workerSrc: ["'self'"]
        }
    })(req, res, next);
});


// =================================================
//                  HTTS CONFIGURATION
// =================================================
app.use(helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
}));


// =================================================
//      X-Content-Type-Options Header Missing
// =================================================
app.use(helmet.noSniff());


// =================================================
//              STATIC FILE ROUTING
// =================================================

app.use('/static', express.static('static'));
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use('/others', express.static(path.join(__dirname, '/static/images/others')));


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

app.use((req, res, next) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - Not Found</title>
        </head>
        <body>
            <h1>404 - Not Found</h1>
            <p>The requested URL ${req.originalUrl} was not found on this server.</p>
        </body>
        </html>
    `);
});

// app.listen(3000, function () {
//     console.log("Server started on http://localhost:3000");
// });

const httpsOptions = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.crt')
};

https.createServer(httpsOptions, app).listen(3443, () => {
  console.log('HTTPS Server running at https://localhost:3443');
});