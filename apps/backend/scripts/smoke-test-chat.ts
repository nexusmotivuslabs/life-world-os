#!/usr/bin/env tsx
/**
 * Smoke Test for Chatbot Connection
 * Tests the chatbot endpoint to ensure it's working correctly
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env.local') });
dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:5001';
const TEST_TOKEN = process.env.TEST_TOKEN || '';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

const results: TestResult[] = [];

async function test(name: string, testFn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await testFn();
    const duration = Date.now() - start;
    results.push({ name, passed: true, duration });
    console.log(`✅ ${name} (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - start;
    const errorMsg = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, error: errorMsg, duration });
    console.error(`❌ ${name}: ${errorMsg} (${duration}ms)`);
  }
}

async function main() {
  console.log('🧪 Chatbot Smoke Test\n');
  console.log(`API URL: ${API_URL}\n`);

  // Test 1: Health Check
  await test('Health Check', async () => {
    const response = await fetch(`${API_URL}/api/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.status || data.status !== 'ok') {
      throw new Error(`Unexpected health status: ${JSON.stringify(data)}`);
    }
  });

  // Test 2: Chat Endpoint (without auth - should fail)
  await test('Chat Endpoint (No Auth - Should Fail)', async () => {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'test' }),
    });
    if (response.status !== 401 && response.status !== 403) {
      throw new Error(`Expected 401/403, got ${response.status}`);
    }
  });

  // Test 3: Chat Endpoint (with auth - if token provided)
  if (TEST_TOKEN) {
    await test('Chat Endpoint (With Auth)', async () => {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_TOKEN}`,
        },
        body: JSON.stringify({ message: 'Hello, what is Life World OS?' }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Chat request failed: ${response.status} ${response.statusText} - ${text}`);
      }
      const data = await response.json();
      if (!data.response || typeof data.response !== 'string') {
        throw new Error(`Invalid response format: ${JSON.stringify(data)}`);
      }
      if (!data.sessionId || typeof data.sessionId !== 'string') {
        throw new Error(`Missing or invalid sessionId: ${JSON.stringify(data)}`);
      }
      console.log(`   Response preview: ${data.response.substring(0, 100)}...`);
    });
  } else {
    console.log('⚠️  Skipping authenticated chat test (TEST_TOKEN not set)');
  }

  // Test 4: CORS Headers
  await test('CORS Headers', async () => {
    const response = await fetch(`${API_URL}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5002',
        'Access-Control-Request-Method': 'POST',
      },
    });
    const corsHeader = response.headers.get('Access-Control-Allow-Origin');
    if (!corsHeader) {
      throw new Error('CORS headers not present');
    }
  });

  // Summary
  console.log('\n📊 Test Summary:');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

  console.log(`   Passed: ${passed}/${results.length}`);
  console.log(`   Failed: ${failed}/${results.length}`);
  console.log(`   Total Duration: ${totalDuration}ms\n`);

  if (failed > 0) {
    console.log('❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('✅ All tests passed!');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

