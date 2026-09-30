# Uber-Style Ride-Hailing Platform

A full-stack ride-hailing platform with separate user and captain experiences. Users can search locations, request rides, follow live trip status, and view ride history. Captains can manage availability, receive nearby ride requests, accept trips, share live location, and complete rides.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Mapbox GL JS, Socket.io Client, React Icons
- **Backend:** Node.js, Express, Socket.io, Axios, Express Validator
- **Data and authentication:** MongoDB Atlas with Mongoose, JWT, bcrypt, HTTP-only cookies

## Repository Layout

```text
backend/    Express API, Socket.io server, models, services, and tests
frontend/   React/Vite user and captain applications
```

## Environment Variables

Copy the example files and replace every placeholder with a deployment-specific value:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

### Backend (`backend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Long, random signing secret; never commit it |
| `PORT` | Yes | Port supplied by the hosting platform |
| `CLIENT_ORIGIN` | Recommended | Comma-separated frontend origin(s) allowed by CORS |
| `PUBLIC_API_URL` | Recommended | Public backend URL used in profile image links |
| `MAPBOX_API` | Yes | Server-side Mapbox token for geocoding and routing |
| `RIDE_REQUEST_RADIUS_KM` | No | Nearby captain dispatch radius; defaults to `5` |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_BASE_URL` | Recommended | Public backend URL, including protocol and no trailing slash |
| `VITE_MAPBOX_TOKEN` | Yes | Public Mapbox browser token, restricted by URL and scopes |

Frontend variables are bundled into browser assets. Only use a restricted public Mapbox token there; never put MongoDB credentials or JWT secrets in the frontend.

## Installation and Local Setup

Requirements: Node.js 20 or newer, npm, a MongoDB Atlas database, and Mapbox tokens.

1. Clone the repository and enter the project directory.
2. Install backend dependencies: `cd backend && npm install`.
3. Create `backend/.env` from `backend/.env.example` and fill in the required values.
4. Install frontend dependencies: `cd ../frontend && npm install`.
5. Create `frontend/.env` from `frontend/.env.example` and set the API URL and public Mapbox token.
6. Start the API from `backend/` with `node server.js`.
7. Start the frontend from `frontend/` with `npm run dev`.

The Vite development server prints its local URL. The API port is controlled by `PORT`; no application code depends on a fixed host or port.

## Production Deployment

1. Provision MongoDB Atlas and restrict database network access to the backend service.
2. Configure backend environment variables in the hosting provider's secret/configuration manager. Set `PORT` to the platform-provided port and `CLIENT_ORIGIN` to the deployed frontend origin.
3. Deploy the backend with `npm install --omit=dev` and `node server.js`. Ensure persistent or object storage is configured for uploaded profile images.
4. Configure the frontend build environment with the deployed backend URL and a URL-restricted public Mapbox token.
5. Build the frontend with `npm run build` and deploy `frontend/dist` to a static host with SPA fallback routing enabled.
6. Enable HTTPS, rotate secrets periodically, configure MongoDB backups, and monitor API, database, and Socket.io logs.

Before release, run `npm run lint` and `npm run build` from `frontend/`, and run the backend test suite from `backend/`.

For a Vercel frontend with a separate Node.js backend, follow [VERCEL_DEPLOYMENT.txt](VERCEL_DEPLOYMENT.txt). Vercel is suitable for the static frontend; deploy the Socket.io backend to a long-running Node.js host such as Render, Railway, Fly.io, or an equivalent service.

## Security Notes

- `.env` files and uploaded profile content are excluded from version control. Use the example files as templates only.
- Server-side Mapbox access remains in the backend; the browser token must be restricted because Vite exposes `VITE_*` values to clients.
- CORS is controlled by `CLIENT_ORIGIN`, and JWT signing depends on the required `JWT_SECRET`.
- Socket and Mapbox resources are explicitly disconnected or removed during React component cleanup.