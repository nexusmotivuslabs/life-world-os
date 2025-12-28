# QA & Engineering Collaboration Guide

**Quick Start for Both Teams**

## For QA Engineers

### Start Here
1. Read `QA_TESTING_SUMMARY.md` - Overview of what changed
2. Review `QA_TESTING_PLAN.md` - Full test plan
3. Use `QA_QUICK_TEST_COMMANDS.md` - Quick reference
4. Log errors in `QA_ERROR_MONITORING.md` - Error tracking
5. Create tasks in `ENGINEER_TASKS_NAVIGATION_PHASE.md` - Issue tracking

### Workflow
```
1. Set up environment
   → cd apps/frontend && npm run dev

2. Run smoke tests
   → Use commands from QA_QUICK_TEST_COMMANDS.md

3. Execute test plan
   → Follow QA_TESTING_PLAN.md

4. Document errors
   → Add to QA_ERROR_MONITORING.md

5. Create tasks
   → Use template in ENGINEER_TASKS_NAVIGATION_PHASE.md

6. Notify engineering
   → For P0/P1 issues, notify immediately
```

## For Software Engineers

### Start Here
1. Read `ENGINEERING_HANDOFF.md` - What changed and what to expect
2. Review `ENGINEER_TASKS_NAVIGATION_PHASE.md` - Task list
3. Monitor `QA_ERROR_MONITORING.md` - Real-time error tracking
4. Use `QA_QUICK_TEST_COMMANDS.md` - Testing commands

### Workflow
```
1. Monitor task list
   → Check ENGINEER_TASKS_NAVIGATION_PHASE.md regularly

2. Pick up tasks
   → Start with P0, then P1

3. Fix issue
   → Follow testing checklist in task

4. Update task
   → Mark as READY FOR QA

5. Notify QA
   → Request re-testing
```

## Document Index

### Testing Documents
- `QA_TESTING_PLAN.md` - Comprehensive test plan
- `QA_TESTING_SUMMARY.md` - Quick overview
- `QA_QUICK_TEST_COMMANDS.md` - Command reference
- `QA_ERROR_MONITORING.md` - Error dashboard

### Engineering Documents
- `ENGINEERING_HANDOFF.md` - Engineering guide
- `ENGINEER_TASKS_NAVIGATION_PHASE.md` - Task tracking

### General Documents
- `RESTART_GUIDE.md` - How to restart app
- `README.md` - Project overview

## Priority Levels

### P0 - Critical (Blocking)
- **Response Time:** Immediate
- **Impact:** App unusable, navigation broken
- **Action:** Fix immediately, notify team

### P1 - High Priority
- **Response Time:** Within 1 hour
- **Impact:** Major feature broken
- **Action:** Fix in current sprint

### P2 - Medium Priority
- **Response Time:** Next sprint
- **Impact:** Minor feature issue
- **Action:** Plan for next sprint

### P3 - Low Priority
- **Response Time:** Backlog
- **Impact:** Cosmetic or edge case
- **Action:** Add to backlog

## Communication

### QA → Engineering
- Create task in `ENGINEER_TASKS_NAVIGATION_PHASE.md`
- Add error to `QA_ERROR_MONITORING.md`
- Notify for P0/P1 issues
- Provide reproduction steps

### Engineering → QA
- Update task status
- Mark as "READY FOR QA" when fixed
- Provide fix summary
- Request re-testing

## Quick Links

### Testing
- [Test Plan](QA_TESTING_PLAN.md)
- [Quick Commands](QA_QUICK_TEST_COMMANDS.md)
- [Error Monitoring](QA_ERROR_MONITORING.md)

### Engineering
- [Handoff Guide](ENGINEERING_HANDOFF.md)
- [Task List](ENGINEER_TASKS_NAVIGATION_PHASE.md)

### General
- [Restart Guide](RESTART_GUIDE.md)
- [Project README](README.md)

---

**Both teams should bookmark this document for quick reference during the testing phase.**

