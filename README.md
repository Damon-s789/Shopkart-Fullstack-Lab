# ShopKart authentication lab

This project contains the ShopKart Labs 01–06 full-stack application: authentication, catalogue, wishlist, cart, checkout, Razorpay Test Mode payment verification, and order history.

## Setup

1. Copy `backend/.env.example` to `backend/.env` and provide a MongoDB connection string and a long JWT secret.
2. Run `npm run install:all` from this folder.
3. Run `npm run dev` to start both servers together, then open the Vite URL.

The Vite development server proxies `/api` calls to `http://localhost:5000`, allowing the browser to retain the HttpOnly authentication cookie.

To add the included sample catalogue to the configured MongoDB database, run `npm run seed --prefix backend`. It is safe to run more than once and does not create duplicate sample products.

## Razorpay Test Mode

Add your Razorpay Test Mode credentials to `backend/.env` before trying Checkout:

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

Use Test Mode only. Keep the secret in `backend/.env`; the backend never returns it to React.

## API endpoints

| Method | Endpoint | Authenticated |
| --- | --- | --- |
| POST | `/customers/register` | No |
| POST | `/customers/login` | No |
| GET | `/customers/me` | Yes |
| POST | `/customers/logout` | Yes |
| PATCH | `/customers/change-password` | Yes |
| POST | `/products` | No |
| GET | `/products?search=keyboard&category=Electronics` | No |
| GET | `/products/:id` | No |
| POST | `/wishlist/:productId` | Yes |
| GET | `/wishlist` | Yes |
| DELETE | `/wishlist/:productId` | Yes |
| PATCH | `/wishlist/:productId/toggle` | Yes |
| POST | `/cart/:productId` | Yes |
| GET | `/cart` | Yes |
| PATCH | `/cart/:productId` | Yes |
| DELETE | `/cart/:productId` | Yes |
| POST | `/orders/create-payment-order` | Yes |
| POST | `/orders/verify-payment` | Yes |
| GET | `/orders` | Yes |
| GET | `/orders/:id` | Yes |
