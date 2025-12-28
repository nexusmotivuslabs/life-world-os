# Product Decoupling from Teams

## Overview
Products are now owned by **Nexus Motivus** (Organization) instead of teams. Teams reference products via a many-to-many association.

## New Structure

### Database Schema
- **Organization**: Owns products (e.g., "Nexus Motivus")
- **Product**: Owned by `organizationId` (not `teamId`)
- **TeamProductAssociation**: Many-to-many relationship (teams can reference products)

### Key Changes
1. Products exist independently of teams
2. If a team is deleted, products remain (they're owned by the organization)
3. Teams can still access products via associations
4. Products can be associated with multiple teams

## Migration Status
- ✅ Database migration completed
- ⏳ Code refactoring in progress
- ⏳ Seed scripts need updating
- ⏳ Frontend needs updating

