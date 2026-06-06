# URL Shortener

A full-stack URL shortener with optional user accounts and Redis-backed redirects.

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Backend** | Node.js, Express 4 |
| **Database** | MongoDB (Mongoose) |
| **Cache** | Redis (ioredis) |
| **Auth** | JWT (HTTP-only cookies), bcrypt |
| **ID generation** | nanoid |
| **Config** | YAML (`config.yaml`) |
| **Frontend** | React 19, Vite, React Router, Tailwind CSS |
| **HTTP client** | Axios |

## High-Level Design

```mermaid
flowchart TB
    User((User / Browser))

    subgraph Frontend["React SPA · Vite :5173"]
        Pages["Pages<br/>Home · Dashboard · Login"]
        Axios["Axios · withCredentials"]
        Pages --> Axios
    end

    subgraph Backend["Express API · :8080"]
        direction TB
        Router["Router<br/>/v1/* · /:shortId"]
        MW["Middleware<br/>validate URL · blacklist · JWT"]
        Ctrl["Controllers"]
        Svc["Services"]
        Router --> MW --> Ctrl --> Svc
    end

    MongoDB[("MongoDB<br/>Users · UrlStore")]
    Redis[("Redis<br/>shortId → longUrl")]

    User --> Pages
    User -->|"④ GET /:shortId"| Router

    Axios -->|"① POST /v1/shorten"| Router
    Axios -->|"② POST /v1/login · /register"| Router
    Axios -->|"③ GET/DELETE /v1/user/urls"| Router

    Svc -->|"write · read"| MongoDB
    Svc -->|"④ cache-aside lookup"| Redis
    Redis -.->|"miss → load from DB · SETEX 24h"| MongoDB

    Svc -.->|"① nanoid shortId · dedupe by longUrl+userId"| MongoDB
    Svc -.->|"② bcrypt + JWT cookie"| MongoDB
    Svc -.->|"③ list/delete owned URLs"| MongoDB
    Router -.->|"④ 301 redirect"| User
```

The React SPA talks to a layered Express API (`Router → Middleware → Controller → Service`). MongoDB is the source of truth; Redis caches redirect lookups for 24h (cache-aside). Guests can shorten URLs; logged-in users get a dashboard to manage their links.

| Flow | Path | What happens |
|------|------|--------------|
| **① Shorten** | `POST /v1/shorten` | Validate URL → optional JWT → generate or return existing short link |
| **② Auth** | `POST /v1/register`, `/login` | Register with bcrypt; login sets HTTP-only `authToken` cookie |
| **③ Dashboard** | `GET/DELETE /v1/user/urls` | JWT required → list or delete URLs owned by user |
| **④ Redirect** | `GET /:shortId` | Redis lookup → MongoDB on miss → 301 to original URL |
