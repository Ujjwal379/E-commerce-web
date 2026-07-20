# ShopEase — MERN E-Commerce Platform

A full-stack e-commerce application: React + Tailwind CSS frontend, Node.js/Express REST API backend,
MongoDB database, JWT authentication, Stripe & Razorpay payments, and an admin dashboard for
product/category/inventory/order management.

## 1. What's included

```
ecommerce-mern/
├── backend/           Express API + MongoDB models, controllers, routes
│   ├── config/         DB connection
│   ├── controllers/     Route handlers (auth, products, orders, etc.)
│   ├── middleware/       Auth, error handling, validation
│   ├── models/          Mongoose schemas (User, Product, Category, Cart, Order)
│   ├── routes/          Express routers
│   ├── utils/           JWT helper, payment clients, DB seeder
│   ├── server.js         App entry point
│   ├── Dockerfile        Container build for VPS deployment
│   └── render.yaml       Render.com deployment blueprint
│
└── frontend/          React 18 + Vite + Tailwind CSS SPA
    ├── src/
    │   ├── api/            Axios client
    │   ├── components/     Navbar, Footer, ProductCard, route guards, etc.
    │   ├── context/        Auth & Cart global state
    │   ├── pages/           Home, Products, Cart, Checkout, Profile, etc.
    │   └── pages/admin/     Admin dashboard, product/category/inventory/order management
    └── public/.htaccess     SPA rewrite rules for Apache-based hosting (Hostinger)
```

## 2. What I could and couldn't do

I generated the **complete, working source code** for every feature you asked for. What I could
**not** do from this chat:
- Actually deploy it and hand you live URLs — I have no hosting/deployment access.
- Create real admin credentials on a live server that doesn't exist yet.

Below is exactly how to do both yourself, in about 20–30 minutes.

## 3. Push to GitHub

```bash
cd ecommerce-mern
git init
git add .
git commit -m "Initial commit: MERN e-commerce app"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## 4. Set up MongoDB (required first)

1. Create a free cluster at https://www.mongodb.com/cloud/atlas.
2. Under **Database Access**, create a user with a password.
3. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) for simplicity, or your host's IP.
4. Copy the connection string — it looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority`

## 5. Backend setup & local run

```bash
cd backend
cp .env.example .env
# edit .env: paste your MONGO_URI, set a strong JWT_SECRET, add Stripe/Razorpay test keys
npm install
npm run seed      # creates the admin user + sample products/categories from your .env values
npm run dev        # starts on http://localhost:5000
```

Your **admin login** is whatever you set in `.env` before running `npm run seed`:
```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
```
Change these to your own values before seeding — this creates the actual admin account in your database.

## 6. Frontend setup & local run

```bash
cd frontend
cp .env.example .env
# edit .env: set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev         # starts on http://localhost:5173
```

## 7. Payment gateway keys

- **Stripe**: https://dashboard.stripe.com/test/apikeys → copy the Secret key into `STRIPE_SECRET_KEY`.
  For webhooks (marks orders paid automatically): `stripe listen --forward-to localhost:5000/api/orders/stripe-webhook`
  in dev, or add a webhook endpoint in the Stripe dashboard pointing at
  `https://your-backend-domain/api/orders/stripe-webhook` in production, then copy the signing secret into
  `STRIPE_WEBHOOK_SECRET`.
- **Razorpay**: https://dashboard.razorpay.com/app/keys → copy Key ID / Key Secret into the backend `.env`,
  and the Key ID into the frontend `.env` as `VITE_RAZORPAY_KEY_ID` (not strictly required since the
  backend also returns it, but handy if you extend the frontend).

## 8. Deploying — important note about Hostinger

Hostinger's **shared/business hosting** plans serve static files (PHP/Apache) and **cannot run a
persistent Node.js/Express process** the way this backend needs. You have two realistic paths:

### Recommended: split deployment (free tier friendly)
- **Frontend → Hostinger** (static hosting) or Vercel/Netlify.
- **Backend → Render.com / Railway.app** (both have working free/low-cost Node.js hosting).
- **Database → MongoDB Atlas** (already set up in step 4).

### Frontend on Hostinger (static React build)
1. `cd frontend && npm install && npm run build` → produces a `dist/` folder.
2. In `dist/`, confirm `.htaccess` and `index.html` are both present (the `.htaccess` from
   `public/` is auto-copied by Vite).
3. In Hostinger's **hPanel → File Manager**, upload the **contents** of `dist/` into `public_html/`
   (or a subfolder if using a subdomain).
4. Before building, set `VITE_API_URL` in `frontend/.env` to your deployed backend's URL, e.g.
   `https://ecommerce-backend.onrender.com/api`, then rebuild.

### Backend on Render.com (free Node hosting)
1. Sign in at https://render.com, click **New → Web Service**, connect your GitHub repo.
2. Set **Root Directory** to `backend`, **Build Command** to `npm install`, **Start Command** to `node server.js`.
3. Add all the environment variables from `backend/.env.example` under Render's **Environment** tab
   (use your real Mongo URI, JWT secret, Stripe/Razorpay keys, and set `CLIENT_URL` to your Hostinger
   frontend URL).
4. Deploy. Render gives you a URL like `https://ecommerce-backend.onrender.com`.
5. Run the seeder once, either via Render's shell (`npm run seed`) or by adding it as a one-off job.

### Backend on a Hostinger VPS (if you have one)
If you're on a **Hostinger VPS** (not shared hosting), you can run Node directly:
```bash
git clone <your-repo-url> && cd ecommerce-mern/backend
npm install --omit=dev
cp .env.example .env   # fill in real values
npm run seed
npm install -g pm2
pm2 start server.js --name ecommerce-backend
pm2 save && pm2 startup
```
Then put Nginx in front of it as a reverse proxy to port 5000, and point your domain/subdomain at it.
The included `Dockerfile` also works directly on a VPS with Docker installed.

## 9. Security checklist before going live
- Set a long, random `JWT_SECRET` (never reuse the example value).
- Set `NODE_ENV=production` on the backend.
- Restrict MongoDB Atlas network access to your backend host's IP instead of `0.0.0.0/0`.
- Use Stripe/Razorpay **live** keys only after testing fully with **test** keys.
- Change the seeded admin password immediately after your first login (via Profile settings — or
  re-run the seeder with new `.env` values on a fresh database).
- Serve everything over HTTPS (Render and Hostinger both provide free SSL).

## 10. Feature checklist (all implemented)
Modern responsive UI · Hero home page · Product listing with search/filter/sort/pagination ·
Product detail with reviews · Cart · Wishlist · JWT auth (register/login/forgot-reset password) ·
User profile with saved addresses · Checkout with Stripe, Razorpay, and Cash on Delivery ·
Order tracking with status timeline · Admin dashboard with stats · Product CRUD · Category CRUD ·
Inventory management with low-stock alerts · Contact form · SEO meta tags via `react-helmet-async`,
`robots.txt`, and clean semantic markup on every page.
