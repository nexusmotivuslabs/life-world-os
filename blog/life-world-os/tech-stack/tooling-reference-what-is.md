# Tooling Reference – Life World OS

**Category**: Life World OS → Tech Stack  
**Tags**: `documentation`, `tooling`, `reference`, `what-is`, `tech-stack`  
**Date**: 2026-01-30  
**Context**: Life World OS – "What is" reference for all tools used in the application

---

A "What is" style overview of the tools and technologies used in the Life World OS application.

---

## Runtime & Language

### What is Node.js?
JavaScript runtime built on Chrome's V8 engine. Enables running JavaScript on the server. Life World OS uses Node 20+ for the backend, scripts, and tooling.

### What is TypeScript?
Typed superset of JavaScript that compiles to plain JavaScript. Adds static typing, better editor support, and fewer runtime errors. The app is written in TypeScript for both frontend and backend.

---

## Frontend

### What is React?
JavaScript library for building user interfaces with components, state, and declarative rendering. The frontend is built with React 18.

### What is Vite?
Modern build tool and dev server. Provides fast HMR (Hot Module Replacement), native ES modules, and optimized production builds via Rollup. Used instead of Create React App.

### What is React Router?
Client-side routing for single-page applications. Handles navigation (e.g. `/loadouts`, `/knowledge`) without full page reloads.

### What is Framer Motion?
Animation library for React. Powers transitions, page animations, and interactive UI feedback.

### What is Lucide React?
Icon library for React. Provides icons like Target, Plus, Trash2 used throughout the UI.

### What is Tailwind CSS?
Utility-first CSS framework. Styling uses classes like `bg-gray-800`, `rounded-lg` instead of separate stylesheets.

### What is Zustand?
Lightweight state management library for React. Simpler alternative to Redux for global state (auth, navigation, etc.).

### What is React Hook Form?
Form library for React. Handles validation, errors, and submission with minimal re-renders.

### What is Zod?
TypeScript-first schema validation library. Used with React Hook Form for form validation, and on the backend for API payload validation.

### What is Recharts?
Charting library for React. Used for data visualizations and graphs.

### What is date-fns?
Modern JavaScript date utility library. Used for formatting and manipulating dates.

### What is react-markdown?
Renders Markdown as React components. Used for displaying content that includes Markdown.

---

## Backend

### What is Express?
Web framework for Node.js. Handles HTTP routes, middleware, and API logic.

### What is Prisma?
TypeScript/Node.js ORM (Object-Relational Mapper). Manages schema, migrations, and typed database access for PostgreSQL.

### What is Prisma Studio?
Web-based GUI for viewing and editing database data. Run with `npx prisma studio` from the backend; opens a browser to browse tables and records.

### What is bcryptjs?
Password hashing library. Used to securely hash and verify user passwords.

### What is jsonwebtoken (JWT)?
Library for creating and verifying JSON Web Tokens. Used for API authentication and session handling.

### What is CORS?
Cross-Origin Resource Sharing. Mechanism that allows the frontend (different origin) to call the backend API. Handled by the `cors` package.

### What is dotenv?
Loads environment variables from `.env` files into `process.env`. Used for database URL, API keys, and other config.

### What is groq-sdk?
SDK for Groq's LLM API. Used for AI features.

### What is google-auth-library?
Google OAuth client library. Used for Google sign-in.

### What is ioredis?
Redis client for Node.js. Used for caching when Redis is enabled.

---

## Database

### What is PostgreSQL?
Relational database management system. Primary data store for users, loadouts, XP, and all app data.

### What is Docker?
Platform for containerizing applications. Used to run Postgres (and other services) in isolated containers for development and deployment.

### What is docker-compose?
Tool for defining and running multi-container Docker applications. Used to spin up Postgres, observability stack, DNS, etc.

---

## Development & Testing

### What is tsx?
TypeScript executor. Runs TypeScript files directly without a build step. Used for scripts, seeds, and backend dev (`tsx watch`).

### What is Vitest?
Unit test runner. Jest-compatible, supports native ESM and TypeScript. Used for backend and frontend tests.

### What is Playwright?
End-to-end testing framework. Runs browser-based tests to validate user flows across the app.

### What is ESLint?
Linter for JavaScript/TypeScript. Catches bugs and enforces code style.

### What is Prettier?
Code formatter. Keeps indentation, quotes, and line length consistent across the codebase.

### What is concurrently?
Runs multiple npm scripts in parallel. Used to run frontend and backend together with `npm run dev`.

---

## Infrastructure & Observability

### What is Nginx?
Web server and reverse proxy. Used for routing, SSL termination, and serving static assets in production.

### What is Prometheus?
Metrics collection and storage system. Used for monitoring backend health and performance.

### What is Grafana?
Dashboard and visualization platform. Used to visualize Prometheus metrics.

### What is Loki?
Log aggregation system. Stores and queries application logs (similar to Prometheus for metrics).

### What is Promtail?
Log shipper. Collects logs and sends them to Loki for indexing and querying.

### What is SonarQube?
Code quality and security analysis platform. Used for static analysis and technical debt tracking.

### What is Portainer?
Web UI for managing Docker. Used to manage containers in deployment environments.

### What is dnsmasq?
Lightweight DNS and DHCP server. Used for local domain resolution (e.g. `*.life-world.local`).

---

## Project Structure

### What is npm workspaces?
npm feature for managing multiple packages in a single repository (monorepo). Life World OS uses it to manage `apps/backend` and `apps/frontend` under one root.

---

**Author**: Development Team  
**Last Updated**: 2026-01-30
