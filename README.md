# NASA Mission Control Project

## Overview

This is a full-stack MERN (MongoDB, Express, React, Node.js) application that simulates a NASA Mission Control Dashboard. It allows users to schedule launches to habitable exoplanets and view historical launch data.

The project uses:
- **Client**: React (with Arwes sci-fi UI framework)
- **Server**: Node.js with Express and Mongoose
- **Database**: MongoDB

## Tech Stack

- **Frontend**: React, Arwes, React Router
- **Backend**: Node.js, Express, Mongoose, csv-parse
- **Database**: MongoDB
- **Testing**: Jest, Supertest
- **CI/CD**: GitHub Actions

## Prerequisites

- Node.js (v18 or v20 recommended)
- NPM
- MongoDB (running locally on port 27017, or use the included Docker setup)

## Installation

1.  Clone the repository.
2.  Install dependencies for both client and server:

    ```bash
    npm install
    ```

    This command runs `npm install` in both `client/` and `server/` directories.

## Running the Application

### Development

To run both client and server in parallel (watch mode):

```bash
npm run watch
```

- **Client**: http://localhost:3000
- **Server**: http://localhost:8000

### Production

To build the client and start the server:

```bash
npm run deploy
```

This builds the React app into `server/public` and starts the Node server.

## Testing

To run tests for both client and server:

```bash
npm test
```

Server tests use an in-memory MongoDB instance.

## API Documentation

The server exposes a REST API at `http://localhost:8000/v1`.

- `GET /v1/planets`: Get all habitable planets.
- `GET /v1/launches`: Get all launches.
- `POST /v1/launches`: Schedule a new launch.
- `DELETE /v1/launches/:id`: Abort a launch.

## Docker

You can also run the application using Docker.

```bash
docker build -t nasa-project .
docker run -p 8000:8000 nasa-project
```
