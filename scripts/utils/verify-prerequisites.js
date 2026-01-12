#!/usr/bin/env node
/**
 * Prerequisites Verification Script
 * Verifies all required software is installed and ports are available
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'

const checks = {
  node: { command: 'node --version', required: true, min: 'v20.0.0' },
  npm: { command: 'npm --version', required: true, min: '9.0.0' },
  docker: { command: 'docker --version', required: true },
  dockerCompose: { command: 'docker compose version', required: true },
  ollama: { command: 'ollama --version', required: false },
  git: { command: 'git --version', required: true },
}

const results = []

console.log('\n🔍 Verifying Prerequisites...\n')

for (const [name, config] of Object.entries(checks)) {
  try {
    const output = execSync(config.command, { encoding: 'utf-8', stdio: 'pipe' })
    const version = output.trim()
    results.push({ name, status: '✅', version, required: config.required })
    console.log(`${'✅'} ${name}: ${version} ${config.required ? '(required)' : '(optional)'}`)
  } catch (error) {
    const status = config.required ? '❌' : '⚠️'
    results.push({ 
      name, 
      status, 
      version: 'Not installed',
      required: config.required 
    })
    console.log(`${status} ${name}: Not installed ${config.required ? '(required)' : '(optional)'}`)
  }
}

// Check Docker is running
console.log('\n🔍 Checking Docker Status...')
try {
  execSync('docker info', { encoding: 'utf-8', stdio: 'pipe' })
  console.log('✅ Docker: Running')
} catch (error) {
  console.log('❌ Docker: Not running (start Docker Desktop)')
  results.push({ name: 'docker-running', status: '❌', version: 'Not running', required: true })
}

// Check port availability
console.log('\n🔍 Checking Port Availability...')
const ports = [3001, 5173, 5433]
const isWindows = process.platform === 'win32'

for (const port of ports) {
  try {
    if (isWindows) {
      execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8', stdio: 'pipe' })
      console.log(`⚠️  Port ${port}: In use`)
    } else {
      execSync(`lsof -i :${port}`, { encoding: 'utf-8', stdio: 'pipe' })
      console.log(`⚠️  Port ${port}: In use`)
    }
  } catch (error) {
    console.log(`✅ Port ${port}: Available`)
  }
}

const failed = results.filter(r => r.required && r.status === '❌')
if (failed.length > 0) {
  console.log('\n❌ Missing required prerequisites:', failed.map(f => f.name).join(', '))
  console.log('See PREREQUISITES.md for installation instructions')
  process.exit(1)
}

console.log('\n✅ All prerequisites met!')
process.exit(0)


