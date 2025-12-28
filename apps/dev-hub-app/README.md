# Developer Hub App

A deployable documentation site for the Developer Hub.

## Overview

This is a standalone Next.js application that serves as the Developer Hub documentation site. It can be deployed independently from the main application.

## Structure

```
apps/dev-hub-app/
├── app/                    # Next.js app directory
├── components/             # React components
├── content/                # Markdown documentation files
│   ├── 00-principles/
│   ├── 10-developer-contracts/
│   ├── 20-workflows/
│   ├── 30-tooling/
│   ├── 40-reference/
│   └── domains/
└── public/                 # Static assets
```

## Development

```bash
cd apps/dev-hub-app
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

## Building

```bash
npm run build
npm start
```

## Deployment

This app can be deployed independently:

- **Vercel**: Connect the `apps/dev-hub-app` directory
- **Docker**: Use the included Dockerfile
- **Static Export**: Configure Next.js for static export

## Content Management

Documentation is stored as Markdown files in the `content/` directory. The app automatically renders these files.

To add new documentation:
1. Add markdown files to the appropriate directory in `content/`
2. The app will automatically pick them up and make them available


