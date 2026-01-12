#!/usr/bin/env node
/**
 * Get version information for deployments
 * Returns: commit hash, branch, tag, timestamp
 */

import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { join } from 'path'

const environment = process.argv[2] || 'dev'
const branch = process.argv[3] || ''

function execGit(command, defaultValue = 'unknown') {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: 'pipe' }).trim()
  } catch (error) {
    return defaultValue
  }
}

function getVersionInfo() {
  // Get current branch if not provided
  const currentBranch = branch || execGit('git rev-parse --abbrev-ref HEAD', 'unknown')
  
  // Get commit hash (short)
  const commitHash = execGit('git rev-parse --short HEAD', 'unknown')
  
  // Get full commit hash
  const fullCommitHash = execGit('git rev-parse HEAD', 'unknown')
  
  // Get commit timestamp
  const commitTimestamp = parseInt(execGit('git log -1 --format=%ct', Date.now().toString()))
  
  // Get commit message (first line, sanitized)
  const commitMessage = execGit('git log -1 --pretty=format:"%s"', 'unknown')
    .split('\n')[0]
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .substring(0, 50) || 'unknown'
  
  // Get latest tag (if any) - this is the source of truth for versioning
  const latestTag = execGit('git describe --tags --abbrev=0', '')
  
  // Get version from git tag or derive from tag format
  // Tags should follow semantic versioning: v1.0.0, v1.1.0, v2.0.0, etc.
  let versionFromTag = null
  let majorVersion = null
  let minorVersion = null
  let patchVersion = null
  
  if (latestTag) {
    // Extract version from tag (remove 'v' prefix if present)
    const tagMatch = latestTag.match(/^v?(\d+)\.(\d+)\.(\d+)/)
    if (tagMatch) {
      majorVersion = parseInt(tagMatch[1])
      minorVersion = parseInt(tagMatch[2])
      patchVersion = parseInt(tagMatch[3])
      versionFromTag = `${majorVersion}.${minorVersion}.${patchVersion}`
    }
  }
  
  // Determine V1/V2 based on git tags only
  // v1.0.0 = V1, v1.1.0+ = V2
  const isV1 = latestTag === 'v1.0.0' || (majorVersion === 1 && minorVersion === 0)
  const isV2 = (majorVersion === 1 && minorVersion >= 1) || majorVersion >= 2
  
  // Generate version tag based on environment
  // For production, prefer git tag; for dev/staging, use branch-commit format
  let versionTag
  switch (environment) {
    case 'prod':
      // Prod: Use latest git tag (semantic version) or commit hash from main
      if (currentBranch === 'main' || currentBranch === 'master') {
        versionTag = latestTag || versionFromTag || `main-${commitHash}`
      } else {
        versionTag = latestTag || versionFromTag || `main-${commitHash}`
      }
      break
    case 'staging':
      // Staging: Use git tag if available, otherwise staging-commit
      versionTag = latestTag || versionFromTag || `staging-${commitHash}`
      break
    case 'dev':
    default:
      // Dev: Use git tag if available, otherwise branch-commit
      versionTag = latestTag || versionFromTag || `${currentBranch}-${commitHash}`
      break
  }
  
  // Build timestamp
  const buildTimestamp = new Date().toISOString()
  
  return {
    version: versionTag,
    commit: commitHash,
    fullCommit: fullCommitHash,
    branch: currentBranch,
    tag: latestTag || null,
    versionFromTag: versionFromTag || null,
    majorVersion,
    minorVersion,
    patchVersion,
    commitMessage,
    commitTimestamp,
    buildTimestamp,
    environment,
    isV1,
    isV2,
    releaseVersion: isV1 ? 'v1' : isV2 ? 'v2' : 'unknown',
  }
}

// Output as JSON
console.log(JSON.stringify(getVersionInfo(), null, 2))


