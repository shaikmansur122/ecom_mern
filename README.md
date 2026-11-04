# ShopNest: MERN e-commerce store

A small but complete online store built with the MERN stack and packaged with Docker Compose.

- **MongoDB**: products, users and orders
- **Express + Node.js**: REST API with JWT login
- **React (Vite)**: catalogue with search, category filters and sorting, product pages, cart, checkout, order history
- **Admin dashboard** (`/admin`): sales stats, add/edit/delete products, update order status (cancelling restocks the items)
- **Docker**: MongoDB, the API and an nginx-served React build, all started with one command

## Run it

```bash
docker compose up -d --build
```

Open http://localhost:3000.

On first start the API seeds 16 products and two accounts:

| Role | Email | Password |
|---|---|---|
| Shopper | demo@shopnest.test | demo1234 |
| Admin | admin@shopnest.test | admin1234 |

Log in as the admin and an **Admin** link appears in the navbar.

These are for local use only. Before deploying anywhere public, remove the shopper in `server/src/seed.js` and
start with your own secrets (the admin login is only read when that account is first created):

```bash
JWT_SECRET=some-long-random-string ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=a-strong-password docker compose up -d --build
```

Other commands:

```bash
docker compose logs -f server   # API logs
docker compose down             # stop (data is kept)
docker compose down -v          # stop and delete the database
```

Port 3000 taken? Run with `APP_PORT=8080 docker compose up -d` (PowerShell: `$env:APP_PORT=8080; docker compose up -d`).

## How it fits together

```
browser ──► client (nginx :80, published on :3000)
              ├── /         React build (single-page app)
              └── /api/*  ─► server (Express :5000) ─► mongo (:27017, internal only)
```

The browser only talks to nginx, so there is no CORS setup. MongoDB is not published to the host.

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/products?q=&category=&sort=` | | List products. `sort`: `price-asc`, `price-desc`, `rating` |
| GET | `/api/products/categories` | | Category names |
| GET | `/api/products/:id` | | One product |
| POST | `/api/auth/register` | | `{ name, email, password }` → `{ user, token }` |
| POST | `/api/auth/login` | | `{ email, password }` → `{ user, token }` |
| GET | `/api/auth/me` | Bearer | Current user |
| POST | `/api/orders` | Bearer | `{ items: [{ productId, qty }], shipping }`. Prices and stock are checked on the server |
| GET | `/api/orders/mine` | Bearer | The logged-in user's orders |
| POST | `/api/products` | Admin | Create a product |
| PUT | `/api/products/:id` | Admin | Update a product |
| DELETE | `/api/products/:id` | Admin | Delete a product |
| GET | `/api/orders` | Admin | All orders, with customer name and email |
| PATCH | `/api/orders/:id/status` | Admin | `{ status }`: `Placed`, `Shipped`, `Delivered` or `Cancelled` (final; restocks items) |

## Project layout

```
server/            Express API
  src/index.js     app setup, MongoDB connection, error handling
  src/models/      User, Product, Order (Mongoose)
  src/routes/      auth, products, orders
  src/seed.js      sample products and demo user
client/            React app (Vite)
  src/pages/       Home, ProductPage, Cart, Checkout, Orders, AuthPage, Admin
  src/context/     auth session and cart state (saved in localStorage)
  nginx.conf       static hosting + /api proxy
docker-compose.yml
```

## Developing without Docker

Needs Node 20+ and MongoDB on `localhost:27017`.

```bash
cd server && npm install && npm run dev    # API on :5000
cd client && npm install && npm run dev    # Vite on :5173, proxies /api to :5000
```
