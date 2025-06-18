# Attendance Tracking System

A modern attendance tracking system built with React, Node.js, and Fastify.

## Features

-   Entry/Exit logging with image matching
-   Modern, responsive UI
-   Redis caching layer
-   MongoDB storage
-   Docker containerization

## Tech Stack

-   Frontend:

    -   React.js
    -   Material-UI
    -   React Webcam
    -   Axios for API calls

-   Backend:
    -   Node.js
    -   Fastify
    -   MongoDB
    -   Redis

## Prerequisites

-   Docker and Docker Compose
-   Node.js 18+
-   npm

## Getting Started

1. Clone the repository
2. Run the application:

```bash
docker-compose up --build
```

The application will be available at:

-   Frontend: http://localhost:3000
-   Backend API: http://localhost:3001

3. Use the following credentials for the admin login:

-   Username: admin
-   Password: admin123

## Project Structure

```
attendance_tracking/
├── frontend/           # React frontend application
├── backend/           # Fastify backend application
├── docker-compose.yml
└── README.md
```

## API Documentation

The API documentation is available at `/api-docs` when running the backend server.

## Testing

Run the test suite:

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test
```

## Further improvements

-   more validation on the UI and backend
-   paging for the admin sessions/history pages
-   store images in a specific file system storage (s3 for example)
-   create proper user registration for admins
-   use consts instead of plain strings in most places
-   create registration option for users, after which with face recognition - we can check whether they are really the ones checking in
-   add prettier
