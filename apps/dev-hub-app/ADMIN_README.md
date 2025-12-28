# Admin Dashboard

The Admin Dashboard provides tools to manage the dev hub content, including Notion integration.

## Access

Navigate to `/admin` in the dev hub application. You'll be prompted for the admin password (configured via `ADMIN_SECRET` environment variable).

## Features

### 1. Notion Integration (`/admin/notion`)

Manage Notion pages and sync content to the dev hub:

- **Browse Pages**: View all pages from your Notion database
- **Select Pages**: Choose which pages to activate for import
- **Save Selection**: Save your selection to the active directory
- **Import**: Convert selected Notion pages to markdown files in the content directory

#### Setup

1. Create a Notion integration at https://www.notion.so/my-integrations
2. Create a Notion database with the following properties:
   - `Title` (Title) - Required
   - `Slug` (Rich Text) - Optional (auto-generated from title)
   - `Category` (Select) - Optional (maps to content directories)
3. Share the database with your integration
4. Copy the database ID from the URL
5. Add credentials to `.env.local`:
   ```env
   NOTION_API_KEY=secret_xxx
   NOTION_DATABASE_ID=xxx
   ADMIN_SECRET=your-password
   NEXT_PUBLIC_ADMIN_SECRET=your-password
   ```

#### Category Mapping

Categories are automatically mapped to content directories:

- `principle` → `00-principles/`
- `contract` → `10-developer-contracts/`
- `workflow` → `20-workflows/`
- `tooling` or `tool` → `30-tooling/`
- `reference`, `architecture`, or `adr` → `40-reference/`
- `domain` → `domains/`
- Default → `content/` (root)

### 2. Content Management (`/admin/content`)

View and navigate to content directories. Content files are managed through:
- Direct file system editing
- Notion integration sync

### 3. Settings (`/admin/settings`)

View current configuration status for:
- Notion integration credentials
- Admin access settings

## Active Directory

Selected Notion pages are tracked in `data/active-pages.json`. This file maintains:
- Selected page IDs
- Page metadata (title, slug, category)
- Last sync timestamps
- Active status

## Security

Currently uses simple password-based authentication. For production, consider:
- JWT-based authentication
- Role-based access control
- Session management
- Rate limiting

## Environment Variables

See `.env.local.example` for required environment variables.

