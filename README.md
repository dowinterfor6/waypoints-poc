# Waypoints Proof of Concept

This is an exploration in learning new technologies: Bun, Nextjs, Google Maps API, and Material UI.

This proof of concept is a mobile responsive app that hits a mock endpoint to retrieve coordinate waypoints to display on a map and call the Google Maps api to create and display a route. An autosuggest service is also implemented to help with location input.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app), that uses Bun.

## Install Bun

Install Bun following the official [instructions](https://bun.sh/docs/installation). If already installed, skip this step.

## Getting Started

Install all necessary dependencies:

```bash
bun install
```

Run the development server (with Bun):

```bash
bun --bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Unit tests

At the root of the project, simply run:

```bash
bun test
```

## Production build

To create the production build:

```bash
bun --bun run build
```
