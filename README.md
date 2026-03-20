# 🛸 NASA Explorer

A full-stack web application for exploring NASA's open data APIs — featuring real-time asteroid tracking, Mars rover photos, daily astronomy imagery, Earth satellite views, and a searchable media library.

**Live demo:** `https://your-deployment-url.vercel.app`  
**Backend API:** `https://your-backend-url.render.com`

---

## ✨ Features

| Section | Description |
|---|---|
| **Dashboard** | Landing page with live APOD preview and live NEO count |
| **APOD** | Astronomy Picture of the Day — browse today's image or explore any date since 1995 |
| **Mars Rovers** | Filter photos by rover (Curiosity, Perseverance, Opportunity, Spirit), camera and Sol |
| **Near-Earth Objects** | Track asteroids for any 7-day window with bar, bubble, and doughnut charts |
| **Earth (EPIC)** | Full-disc Earth imagery from DSCOVR satellite with an interactive slideshow |
| **Image Library** | Full-text search across NASA's entire media archive with pagination |

---

## 🗂 Repository Structure

```
nasa-explorer/
├── frontend/                  # React SPA
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── __tests__/         # React Testing Library tests
│   │   ├── components/        # Shared UI components + CSS modules
│   │   │   ├── Nav.jsx
│   │   │   ├── Nav.module.css
│   │   │   ├── UI.jsx
│   │   │   └── UI.module.css
│   │   ├── hooks/
│   │   │   └── useFetch.js    # Generic async data hook
│   │   ├── pages/             # Route-level page components
│   │   │   ├── Dashboard.jsx / .module.css
│   │   │   ├── Apod.jsx / .module.css
│   │   │   ├── Mars.jsx / .module.css
│   │   │   ├── Neo.jsx / .module.css
│   │   │   ├── Epic.jsx / .module.css
│   │   │   └── Search.jsx / .module.css
│   │   ├── styles/
│   │   │   └── global.css     # CSS variables & design tokens
│   │   ├── utils/
│   │   │   └── api.js         # Axios API service layer
│   │   ├── App.jsx
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
├── backend/                   # Node.js / Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── apod.js        # APOD endpoint
│   │   │   ├── mars.js        # Mars Rover Photos + manifests
│   │   │   ├── neo.js         # Near-Earth Objects
│   │   │   ├── epic.js        # DSCOVR EPIC imagery
│   │   │   └── search.js      # NASA Image & Video Library
│   │   ├── utils/
│   │   │   └── nasaClient.js  # Configured Axios NASA API client
│   │   ├── app.js             # Express app setup (middleware, routes)
│   │   └── server.js          # HTTP server entry point
│   ├── tests/
│   │   └── app.test.js        # Supertest integration tests
│   ├── .env.example
│   ├── jest.config.json
│   └── package.json
│
├── package.json               # Root workspace scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A free NASA API key from [https://api.nasa.gov](https://api.nasa.gov) *(the `DEMO_KEY` works but is rate-limited to 30 req/hour)*

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/nasa-explorer.git
cd nasa-explorer
```

---

### 2. Configure environment variables

**Backend:**

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
NASA_API_KEY=your_actual_nasa_api_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend:**

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

> In development, the frontend proxies API requests through `package.json`'s `"proxy"` field, so you can also leave `REACT_APP_API_URL` unset.

---

### 3. Install dependencies

From the project root:

```bash
npm run install:all
```

Or individually:

```bash
npm install --prefix frontend
npm install --prefix backend
```

---

### 4. Start the development servers

From the project root (starts both concurrently):

```bash
npm run dev
```

Or separately:

```bash
# Terminal 1 — backend on :5000
npm run start:backend

# Terminal 2 — frontend on :3000
npm run start:frontend
```

Open **http://localhost:3000** in your browser.

---



## 🛠 Tech Stack

**Frontend**
- React 18 (hooks, lazy loading, Suspense)
- React Router v6
- Chart.js + react-chartjs-2 (Bar, Bubble, Doughnut charts)
- CSS Modules with custom design tokens
- Axios
- React Testing Library + Jest

**Backend**
- Node.js + Express
- Axios (NASA API client with interceptors)
- Helmet (security headers)
- express-rate-limit (API protection)
- Morgan (request logging)
- CORS
- Jest + Supertest (integration tests)

---

## 🎨 Design Decisions

- **CSS Modules** were chosen over a UI library to keep the bundle lean and give full aesthetic control.
- A **deep-space dark theme** with a CSS variable design system ensures consistent colours across every component.
- The backend acts purely as a **proxy and data-shaping layer** — no data is persisted, keeping the architecture stateless and horizontally scalable.
- **Rate limiting** on the Express layer protects the NASA API key from being exhausted.
- All API calls are wrapped in `try/catch` with normalised error objects so the UI always has a consistent error shape to display.

---

## 📄 License

MIT
