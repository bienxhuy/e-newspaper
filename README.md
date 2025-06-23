
# Bao Tuoi Gia Offline - Web Application

A feature-rich online newspaper platform allowing users to read, search, and interact with articles. Includes role-based access for writers, editors, and admins. Premium content is accessible to VIP users.

## 🧠 Key Features

### 🔍 Article Access & Search
- View latest and hottest articles (weekly / all-time)
- Search by **category**, **tag**, or **keyword** using fulltext-search
- Download and read premium articles for VIP users

### 🧑‍💬 User Interaction
- Comment on articles
- Register/login with email or social accounts (Google, Facebook)
- Upgrade to VIP status for premium access

### ✍️ Role-based Capabilities
- **Writer**: Submit and manage own articles
- **Editor**: Review, publish, or reject unpublished articles
- **Admin**: 
  - Full CRUD on articles, users, tags, and categories
  - Manage user roles and permissions

## ⚙️ Tech Stack

### 👨‍💻 Backend
- **Node.js** & **Express** – core server framework
- **MySQL** (via `mysql2`, `knex`) – relational database
- **Passport.js** – user authentication (local + Google + Facebook)
- **Session Handling** – `express-session`

### 💻 Frontend
- **Handlebars** (via `express-handlebars`) – templating engine
- **Bootstrap 4** – responsive UI
- **SweetAlert2** / **Toastr** – user notifications and alerts

### 📦 Other Key Libraries
- **Multer** – file uploads
- **PDFKit** / **Puppeteer** – generate or render PDFs (e.g., for article downloads)
- **Bcrypt.js** – password hashing
- **Nodemailer** – email sending (e.g., registration, verification)
- **Moment.js** / **Numeral.js** – date and number formatting
- **dotenv** – environment variables
- **Cheerio** – HTML parsing/manipulation (used for scraping or content cleanup)
- **fs-extra** – file system utilities

### 🔧 Dev Tools
- **Nodemon** – auto server restarts during development
- **LiveReload / connect-livereload** – hot-reloading

## 🧪 Setup & Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/bienxhuy/e-newspaper.git
   cd e-newspaper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in root:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL='http://localhost:3000/auth/google/callback'

   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   FACEBOOK_CALLBACK_URL='http://localhost:3000/auth/facebook/callback'

   MAIL_MAILER=smtp
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your_email@example.com
   MAIL_PASSWORD=your_email_app_password
   MAIL_ENCRYPTION=TLS
   MAIL_FROM_ADDRESS=your_email@example.com
   MAIL_FROM_NAME="${APP_NAME}"

   APP_NAME=Tuổi Già E-Newspaper
   APP_ENV=http://localhost:3000/login-register

   RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

   DB_HOST=your-host-name
   DB_PORT=3306
   DB_USER=your-username
   DB_PASSWORD=your-password
   DB_NAME=epaperdb
   ```

5. **Set up the database**
   - Create database (our application's database name is epaperdb)
   - Run SQL query in /sql folder
   - Configure via `db.js`

7. **Run the application**
   \`\`\`bash
   npm run dev
   \`\`\`

## 🛡️ User Roles & Permissions

| Role    | Capabilities                             |
|---------|------------------------------------------|
| Reader  | Browse, search, comment, upgrade to VIP  |
| VIP     | Everything Reader has + download premium |
| Writer  | Reader + Submit/edit own articles        |
| Editor  | Reader + Manage unpublished articles     |
| Admin   | Reader + Full CRUD + role management     |

## 📝 To-Do / Potential Enhancements

- [ ] Add article recommendation system
- [ ] Audit log for admin actions
- [ ] Theme customization (dark/light mode)
- [ ] PWA support for offline reading

## 👤 Author

Burh Burh – HCMUTE IT Students  
- **Biện Xuân Huy** – [https://github.com/bienxhuy](https://github.com/bienxhuy)
- **Lê Gia Huy** – [https://github.com/leejahy25](https://github.com/leejahy25)
- **Nguyễn Tiến Huy** – [https://github.com/myuh250](https://github.com/myuh250)
- **Nguyễn Trường** – [https://github.com/nguyentruong0904](https://github.com/nguyentruong0904)

---

Feel free to contribute, suggest features, or report bugs via issues or pull requests.
