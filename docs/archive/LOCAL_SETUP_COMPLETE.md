# Local Setup Complete

## Services Running

✅ **Database:** PostgreSQL running on port 5433 (life-world-os-db)  
✅ **Backend:** Running on http://localhost:3001  
✅ **Frontend:** Running on http://localhost:5173  

---

## Migration Applied

✅ **Migration:** `20251224144822_add_energy_and_tick_tracking`
- Added `energy` field to `resources` table (INT, default 100)
- Added `lastTickAt` field to `users` table (TIMESTAMP, nullable)

**Existing records updated:**
- All existing resources now have `energy = 100`
- All existing users have `lastTickAt = NULL` (will initialize on first action)

---

## What to Test

### Energy System (Step 1)

1. **View Energy Display**
   - Open http://localhost:5173
   - Log in or register
   - Dashboard should show Energy section with battery indicator
   - Energy should show current/usable/cap values

2. **Test Energy Consumption**
   - Start with 100 energy
   - Perform actions (Work Project, Exercise, Learning, etc.)
   - Energy should decrease with each action
   - After 3-4 actions, you should run out
   - Next action should fail with "Insufficient energy" error

3. **Test Capacity Modifier**
   - If Capacity < 30, usable energy should be capped at 70
   - If Capacity ≥ 80, usable energy can go up to 110
   - Energy display should show the capped value

4. **Test Daily Tick**
   - Perform actions to reduce energy
   - Refresh page - energy should stay reduced (not reset)
   - Wait until next day OR manually set `lastTickAt` to yesterday in database
   - Perform any action - energy should reset to 100

### Action Costs (Step 2)

1. **All Actions Cost Energy**
   - Main activities (Work, Exercise, Learning, Save) - ✅
   - Training task completion - ✅
   - Investment creation - ✅ (fixed)

2. **Energy Enforcement**
   - Try actions with < required energy - should fail
   - Error message should show current/required energy
   - No action should succeed without energy check

---

## Quick Access

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health
- **Prisma Studio:** `cd apps/backend && npm run studio`

---

## Stopping Services

Press `Ctrl+C` in the terminal where services are running, or:

```bash
# Kill background processes (if running in background)
pkill -f "tsx watch"
pkill -f "vite"
```

Database will keep running (Docker container).

---

## Restarting Services

```bash
# Backend
cd apps/backend && npm run dev

# Frontend (new terminal)
cd apps/frontend && npm run dev

# Or both from root
npm run dev
```

---

## Phase 1 Progress

✅ **Step 1:** Energy as first-class resource - APPROVED  
✅ **Step 2:** Universal action cost enforcement - COMPLETE  

**Next Steps:**
- Step 3: Implement deterministic Daily Tick (enhanced)
- Step 4: Activate decay mechanics
- Step 5: Apply Capacity modifiers to outcomes
- Step 6: Introduce Burnout failure state
- Step 7: Enforce over-optimisation penalties
- Step 8: Lock UI truth source

---

## Troubleshooting

### Backend not starting
- Check if port 3001 is in use: `lsof -i :3001`
- Check backend logs for errors
- Verify database connection in `.env`

### Frontend not starting
- Check if port 5173 is in use: `lsof -i :5173`
- Check frontend logs for errors
- Verify `VITE_API_URL` in frontend `.env`

### Database connection issues
- Check if Docker container is running: `docker ps | grep life-world-os-db`
- Verify DATABASE_URL matches docker-compose.yml (port 5433)
- Check container logs: `docker logs life-world-os-db`

---

## Development Tips

1. **Energy Display** - Look for the new Energy section on dashboard (above Resources)
2. **Action Costs** - Check console/network tab to see energy deducted
3. **Energy Errors** - Try actions when energy is low to see error messages
4. **Database** - Use Prisma Studio to inspect energy values: `cd apps/backend && npm run studio`

