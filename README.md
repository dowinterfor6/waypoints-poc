# Waypoints Proof of Concept

This is an exploration in learning new technologies: Bun, Nextjs, Google Maps API, and Material UI.

This proof of concept is a mobile responsive app that hits a mock endpoint to retrieve coordinate waypoints to display on a map and call the Google Maps api to create and display a route. An autosuggest service is also implemented to help with location input.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app), that uses Bun.

## Install Bun

Install Bun following the official [instructions](https://bun.sh/docs/installation). If already installed, skip this step.

## Obtain Google Maps API Key

Obtain Google Maps Platform API Key.

Create a `.env` file at root, and add entry for `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=[API_KEY_HERE]`

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

This is incredibly inconvenient but Bun's `mock.restore` doesn't seem to be working, [stack overflow thread](https://github.com/oven-sh/bun/issues/7823) for reference.

Also, NextJS doesn't like (component) test files outside of `__tests__` folder, or rather, doesn't like them inside `pages`, so I moved them all to `__tests__`.

## Production build

To create the production build:

```bash
bun --bun run build
```

## Deployment

Since this creates a static export (SPA, not SSR), and Nextjs doesn't do relative imports by default, in order to view the production build by local file browser, go through all the imports to ensure they are relative imports.
E.g. anything that's `"/_next/etc.js'"` should be `"./_next/etc.js"`.

Otherwise, set up custom deployment via github actions like [this guide](https://www.freecodecamp.org/news/how-to-deploy-next-js-app-to-github-pages/) to get automatic building and deployment to the correct custom domain.

## Misc

Use the [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/quotas?project=waypoints-maps-api&api=maps-backend.googleapis.com) to manage quotas for the API

Refer to the [pricing list](https://developers.google.com/maps/billing-and-pricing/pricing) for pricing

`.nojekyll` tells Github Pages to not use Jekyll for the Github Actions. Jeckyll seems to ignore all files/folders with `_` underscore prefixes, causing errors in deploying NextJS projects
