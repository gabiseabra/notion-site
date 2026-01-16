# notion-site

A Notion-backed blog platform with a modern tech stack.

This is a full-stack web application that transforms your Notion workspace into a published blog.
Content is managed entirely through a Notion database, providing a seamless publishing experience without the need for
traditional CMS backends.

**Status**: Work in progress 🚧

## Tech Stack

### Frontend

- **react** 19
- **react-router** 7
- **suspend-react**
- **@orpc/client**
- **vite** 4
- **sass**

### Backend

- **Node.js** 18+
- **express** 4
- **@orpc/server**

### Shared

- **typescript** 5
- **zod** 3
- **ts-pattern** 5

## Project Structure

This is a monorepo using npm workspaces and typescript compose builds with following packages:

- **common** - Shared types, schemas, and DTOs
    - Location: [common](./common)
    - Exports: API contracts, Notion schema definitions

- **api** - Backend server (Express + ORPC)
    - Location: [api](./api)
    - Features: Notion API integration, RSS feed generation

- **web** - Frontend app (React + Vite)
    - Location: [web](./web)
    - Features: Blog post listing and viewing

## Notion Database Schema

The blog reads content from a Notion database with the following properties.
See `common/src/dto/notion/blog-post.ts` for the complete schema definition.

**Page Properties:**

- Title (rich text)
- Status (status)
- Tags (multi-select)
- Publication Date (date)

## Setup Instructions

### Step 1: Clone and Install

```bash
git clone git@github.com:gabiseabra/notion-site.git
cd notion-site
```

```bash
npm run install
```

### Step 2 Configure Environment Variables

Copy [.env.example](.env.example) file to `.env`, and change the `NOTION_TOKEN` and `NOTION_DATABASE_ID` with values
obtained from
the steps below.

```bash
cp .env.example .env
```

### Step 2.1: Create Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "Create new integration"
3. Copy the **Internal Integration Secret** (your NOTION_TOKEN)

### Step 2.2: Get Database ID

1. Open your posts database in Notion
2. Copy the ID from the URL:  `https://www.notion.so/{NOTION_DATABASE_ID}?v=... `
3. Use only the UUID part (without special characters)

### Step 3: Run the project

Use the `dev` command to run in dev mode:

```bash
npm run dev
```

Use the `start` command to run in production mode:

```bash
npm run build
npm run start
```

Use `docker-compose` to run with Docker:

```bash
docker-compose --env-file .env up
```

### Dev mode

There are enhanced visibility tools in dev mode you help with editing:

- [x] List hidden posts
- [ ] Go to edit mode
- [ ] Make a comment as an authenticated user

## Deploying

This project is deployed on Render at [blog.gabiseabra.dev](https://blog.gabiseabra.dev).
The deployment runs `npm run build; npm run start` in a node container,
which starts the server serving static files from the [web](./web) and API routes from the [api](./api) build.

## TODO / Roadmap

- [ ] Support unsupported blocks (e.g. code, callout)
- [ ] Add search bar and tags filter
- [ ] Add RSS feed
- [ ] Don't show posts published in the future
