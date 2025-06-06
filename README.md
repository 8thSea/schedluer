# Bill Scheduler

This is a simple full-stack web application that lets small business owners manage recurring bills for their clients. The app uses **Node.js/Express** for the API and **React** (via CDN) for the front-end.

## Getting Started

1. Install dependencies for the backend:

```bash
cd backend
npm install
```

2. Start the server (serves API and front-end):

```bash
npm start
```

3. Open your browser at [http://localhost:3000](http://localhost:3000) to use the app.

Data is saved to `backend/data.json`.

## Features

- Manage clients and their contact information.
- Create and track recurring bills for each client.
- Mark bills as paid and see payment history.
- Color-coded list of bills showing paid, overdue, or upcoming status.
- Download a CSV report of payments per client.

This project is intentionally simple (no database or build step) so it can be easily modified or extended.
