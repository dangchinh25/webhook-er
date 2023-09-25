# Webhook-Er

## Prerequisites

- Docker ([Installation guide](https://docs.docker.com/get-started/))

## Installation

1. Setup environment variables.
   Create environment config file and change environment variable with the correct variables.

```sh
cp .env.example .env
```

## Running development server

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Running Integration Tests Locally (via Docker Compose)

### Create Temporary Database

```sh
npm run temp-database-up
```

### Run Existing Migration Scripts

```
npm run migrate
```

### Drop Temporary Database

```
npm run temp-database-down
```
