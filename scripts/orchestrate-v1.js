#!/usr/bin/env node
/**
 * V1 Release Orchestrator
 * 
 * Tracks todos, manages tasks, and communicates decisions
 * Run with: node scripts/orchestrate-v1.js
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const TASKS_FILE = join(process.cwd(), '.development-tasks.md')
const PLAN_FILE = join(process.cwd(), '.v1-release-plan.md')

function readTasks() {
  try {
    return readFileSync(TASKS_FILE, 'utf-8')
  } catch (error) {
    console.error('Error reading tasks file:', error)
    return ''
  }
}

function getTaskStatus(tasksContent) {
  const criticalTasks = (tasksContent.match(/- \[ \] \*\*.*?\*\*:/g) || []).length
  const completedTasks = (tasksContent.match(/- \[x\] \*\*.*?\*\*:/g) || []).length
  const inProgressTasks = (tasksContent.match(/Status.*🚧/g) || []).length
  
  return {
    total: criticalTasks + completedTasks,
    completed: completedTasks,
    inProgress: inProgressTasks,
    remaining: criticalTasks,
    progress: ((completedTasks / (criticalTasks + completedTasks)) * 100).toFixed(1)
  }
}

function getNextActions(tasksContent) {
  const actions = []
  
  // Find tasks marked as "Not Started" or "In Progress"
  const taskRegex = /- \[ \] \*\*(.*?)\*\*:.*?Status.*?🔴/gs
  const matches = [...tasksContent.matchAll(taskRegex)]
  
  matches.slice(0, 5).forEach(match => {
    const taskName = match[1].trim()
    actions.push(`- ${taskName}`)
  })
  
  return actions
}

function displayStatus() {
  const tasksContent = readTasks()
  const status = getTaskStatus(tasksContent)
  const nextActions = getNextActions(tasksContent)
  
  console.log('\n📊 V1 Release Status\n')
  console.log(`Progress: ${status.progress}%`)
  console.log(`Completed: ${status.completed}`)
  console.log(`In Progress: ${status.inProgress}`)
  console.log(`Remaining: ${status.remaining}\n`)
  
  if (nextActions.length > 0) {
    console.log('🎯 Next Actions:\n')
    nextActions.forEach(action => console.log(action))
    console.log('')
  }
  
  console.log('📋 Full task list: .development-tasks.md')
  console.log('📋 Release plan: .v1-release-plan.md\n')
}

function displayDecisions() {
  console.log('\n🤔 Decisions Required\n')
  
  console.log('1. Git Flow Strategy')
  console.log('   📄 See: GIT_FLOW_STRATEGY.md')
  console.log('   💡 Recommendation: GitLab Flow (Option 3)\n')
  
  console.log('2. Navigation Refactoring')
  console.log('   📄 See: NAVIGATION_ASSESSMENT.md')
  console.log('   💡 Recommendation: Minimal Changes (Option 1)\n')
  
  console.log('3. Observability Tool')
  console.log('   📄 See: .v1-release-plan.md')
  console.log('   💡 Recommendation: Prometheus + Grafana\n')
  
  console.log('💬 Review options and communicate decision\n')
}

function displayOptions() {
  console.log('\n🎛️  Available Options\n')
  console.log('1. View status')
  console.log('2. View decisions')
  console.log('3. View navigation assessment')
  console.log('4. View git flow options')
  console.log('5. Exit\n')
}

function main() {
  const command = process.argv[2]
  
  switch (command) {
    case 'status':
      displayStatus()
      break
    case 'decisions':
      displayDecisions()
      break
    case 'nav':
      console.log('\n📄 Navigation Assessment: NAVIGATION_ASSESSMENT.md\n')
      break
    case 'git':
      console.log('\n📄 Git Flow Options: GIT_FLOW_STRATEGY.md\n')
      break
    case 'help':
    case '--help':
    case '-h':
      displayOptions()
      break
    default:
      console.log('\n🚀 V1 Release Orchestrator\n')
      displayStatus()
      displayDecisions()
      displayOptions()
      console.log('Usage: node scripts/orchestrate-v1.js [status|decisions|nav|git|help]\n')
  }
}

main()


