# 🚗 Pooler — Smart, Eco-Friendly Carpooling Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-7.8-1B222C?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

---

## 📋 Copy-Paste GitHub Repository Description
> A premium, modern Next.js 16 (React 19) and Tailwind CSS v4 carpooling web application featuring real-time chat (Pusher), interactive maps (Leaflet + OpenRouteService), driver verification, automated fare splitting, and carbon footprint tracking.

---

## 💡 How Pooler is Helpful (Overall View)

**Pooler** is a state-of-the-art Web Application designed to solve daily commute challenges like rising fuel costs, heavy traffic congestion, and growing carbon footprints. By matching verified drivers who have empty seats with passengers heading the same way, Pooler creates an efficient, budget-friendly, and social travel network.

### Key Value Propositions
*   **Cost Efficiency:** Automates fare calculations and splits fuel and toll expenses transparently, removing the awkwardness of manual negotiations.
*   **Eco-Friendly (Carbon Tracker):** Features a dedicated sustainability metrics dashboard that tracks and displays carbon offset statistics for every shared commute.
*   **Vetted Trust Architecture:** Employs an interactive driver-passenger feedback system, user ratings, detailed vehicle registration logs, and driving licence checks.
*   **Seamless Map & Route Interactivity:** Uses Leaflet Maps coupled with OpenRouteService and Google Places API to plot, preview, and match exact routes visually.
*   **Real-Time Interactions:** Employs Pusher Websockets to power instant message exchanges for ride coordination without page refreshes.
*   **Premium Interactive Design:** Styled with a modern Glassmorphic theme using Tailwind CSS v4, smooth micro-animations, and an interactive Three.js 3D landing model.

---

## 🛠️ Tech Stack & Architecture

*   **Frontend & Routing:** Next.js (App Router, React 19)
*   **Styling & UI:** Tailwind CSS v4 (PostCSS config), Lucide Icons
*   **Database ORM:** Prisma Client with native `@prisma/adapter-pg` driver adapters
*   **Database Engine:** PostgreSQL (supported locally, via Docker, or managed clouds like Neon)
*   **Real-Time Communications:** Pusher API Channels (WebSockets)
*   **Maps & Routing:** Leaflet, React Leaflet, OpenRouteService API, Google Maps/Places API
*   **Authentication:** NextAuth.js (Session & JSON Web Tokens credentials system)
*   **Containerization:** Docker & Docker Compose orchestrations

---

## 🚀 How to Run Pooler on Your System

You can run Pooler using two different methods: **Local Node.js Development** or **Orchestrated Docker Containers**.

### Prerequisites
1.  **Node.js v20+** installed on your system (for local setup).
2.  **Docker Desktop** (if you prefer running via Docker containers).
3.  A PostgreSQL database instance (Neon.tech or a local Postgres server) if running locally.

---

### Method 1: Local Development Server

#### 1. Clone & Navigate
```bash
git clone <your-repository-url>
cd "Car pooling"
```

#### 2. Install Dependencies
Run the installation with peer dependencies enabled (due to React 19 / Next.js ecosystem alignments):
```bash
npm install --legacy-peer-deps
```

#### 3. Environment Variables Configuration
Create a `.env` file in the root directory and define the following variables:
```env
# Database Connection URL (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/pooler_db?schema=public"

# NextAuth Authentication Config
NEXTAUTH_SECRET="your-32-character-base64-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Pusher Credentials (Real-time Messaging)
PUSHER_APP_ID="your_pusher_app_id"
PUSHER_KEY="your_pusher_key"
PUSHER_SECRET="your_pusher_secret"
NEXT_PUBLIC_PUSHER_KEY="your_pusher_key"
PUSHER_CLUSTER="your_pusher_cluster"

# Maps APIs
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
NEXT_PUBLIC_OPENROUTESERVICE_API_KEY="your_open_route_service_api_key"
```

#### 4. Database Setup & Migrations
Synchronize your database schema defined in `prisma/schema.prisma` with your database instance:
```bash
# Generate the local typescript Prisma client
npx prisma generate

# Push the schema changes directly to your PostgreSQL database
npx prisma db push
```

#### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

### Method 2: One-Click Launch via Docker Compose

Docker Compose builds the Next.js application container and boots up a local PostgreSQL Alpine container simultaneously. Environment variables and database migrations are handled automatically.

#### 1. Spin Up Container Orchestration
```bash
docker-compose up --build
```

#### 2. Automated Scripts inside Container
*   The web container boots via `entrypoint.sh`.
*   It automatically runs `npx prisma db push --accept-data-loss` to sync database tables with the containerized Postgres database.
*   The production Next.js standalone server starts on port `3000`.

Open [http://localhost:3000](http://localhost:3000) in your web browser. To shut down the containers:
```bash
docker-compose down -v
```

---

## 🧑‍💻 How to Work & Customize the Codebase

If you or your team want to customize, add features, or update database structures, follow these guidelines:

### Directory Mapping
*   [src/app/](file:///c:/Users/FASTECH%20LAPTOP/main%20projects/Car%20pooling/src/app/): Main App Router files, layouts, and page endpoints.
    *   [api/](file:///c:/Users/FASTECH%20LAPTOP/main%20projects/Car%20pooling/src/app/api/): Internal API endpoints (Rides, Bookings, Chat, Profiles, and NextAuth handler).
    *   [rides/](file:///c:/Users/FASTECH%20LAPTOP/main%20projects/Car%20pooling/src/app/rides/): Ride creation, details lookup (`[id]`), and Leaflet mapping search layouts.
    *   [chat/](file:///c:/Users/FASTECH%20LAPTOP/main%20projects/Car%20pooling/src/app/chat/): Pusher real-time conversation panel between drivers and passengers.
    *   [dashboard/](file:///c:/Users/FASTECH%20LAPTOP/main%20projects/Car%20pooling/src/app/dashboard/): Personalized panel listing past travels, carbon footprint values, and user ratings.
*   [src/components/](file:///c:/Users/FASTECH%20LAPTOP/main%20projects/Car%20pooling/src/components/): Reusable UI Components (Navbar, 3D Canvas Logo, Loader animations).
*   [src/lib/](file:///c:/Users/FASTECH%20LAPTOP/main%20projects/Car%20pooling/src/lib/): Config files (NextAuth configurations, Pusher client/server initiators, Prisma client setup).
*   [prisma/schema.prisma](file:///c:/Users/FASTECH%20LAPTOP/main%20projects/Car%20pooling/prisma/schema.prisma): Database model specifications.

### Database Workflows
When modifying database structures (adding columns, new models, relationships):
1.  Open [schema.prisma](file:///c:/Users/FASTECH%20LAPTOP/main%20projects/Car%20pooling/prisma/schema.prisma) and perform edits.
2.  Run `npx prisma db push` to synchronize changes with your database.
3.  Run `npx prisma generate` to re-build TypeScript typings for code suggestions.
4.  Open the interactive Database Graphical User Interface to edit records easily:
    ```bash
    npx prisma studio
    ```

### Linting & Formatting Check
```bash
npm run lint
```

---

## 🌐 Going Live (Production Deployment Options)

To take this application live so others can use it, you have several primary strategies:

### Option A: Vercel + Managed Database (Highly Recommended)
Next.js applications run optimally on Vercel due to automatic static/dynamic route optimizations and serverless API execution.

1.  **Host the Database:** Spin up a free serverless PostgreSQL database on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com). Copy the PostgreSQL connection string.
2.  **Create Real-Time App:** Register for a free account at [Pusher.com](https://pusher.com), create a new app channel, and grab the API keys.
3.  **Setup Google Cloud console / OpenRouteService:** Generate the Map API keys.
4.  **Import GitHub Repo to Vercel:**
    *   Navigate to Vercel and create a new project.
    *   Link your Git repository.
    *   Paste all environment variables defined in your `.env` (including the database URL and Pusher credentials).
5.  **Build Command:** Vercel automatically detects Next.js build configurations. Ensure you configure the build command as `npx prisma generate && next build` so the database client is generated before compiling code.

---

### Option B: Self-Hosted VPS (Docker / Dokku / Coolify)
If you prefer complete ownership, deploy the app on a Virtual Private Server (VPS) such as DigitalOcean, AWS EC2, or Linode.

1.  SSH into your server and install Docker & Docker Compose.
2.  Clone this repository onto the server.
3.  Modify environment variables in the `docker-compose.yml` to point to your live domain (updating `NEXTAUTH_URL` from `http://localhost:3000` to `https://your-domain.com`).
4.  Configure an SSL reverse proxy (e.g., Nginx, Caddy, or Traefik) to route incoming HTTPS traffic on port 443 to port 3000 of your Docker container.
5.  Run:
    ```bash
    docker-compose up -d --build
    ```

---

### Option C: Railway or Render Cloud
These platforms support direct GitHub repository linkages and Docker container runtimes:
1.  Connect your GitHub repository.
2.  Add a PostgreSQL database service directly inside Railway.
3.  Inject all required Environment Variables.
4.  Railway/Render will automatically build the `Dockerfile` or boot the Node app using the build scripts, executing migrations smoothly.
