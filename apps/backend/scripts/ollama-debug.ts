#!/usr/bin/env tsx
/**
 * Ollama Debug Tool
 * 
 * Usage:
 *   npm run ollama:debug
 *   npm run ollama:debug -- --test "Hello"
 *   npm run ollama:debug -- --models
 *   npm run ollama:debug -- --show deepseek-r1:1.5b
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'deepseek-r1:1.5b';

interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  eval_count: number;
}

async function listModels(): Promise<void> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    const data = await response.json();
    const models: OllamaModel[] = data.models || [];
    
    console.log('\n📦 Available Models:');
    console.log('─'.repeat(50));
    if (models.length === 0) {
      console.log('  No models found. Pull a model first: ollama pull deepseek-r1:1.5b');
    } else {
      models.forEach((model) => {
        const sizeGB = (model.size / 1024 / 1024 / 1024).toFixed(1);
        console.log(`  ✅ ${model.name.padEnd(25)} ${sizeGB} GB`);
      });
    }
    console.log('');
  } catch (error) {
    console.error('❌ Error listing models:', error);
  }
}

async function showModel(modelName: string): Promise<void> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/show`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName }),
    });
    const data = await response.json();
    
    console.log(`\n📋 Model Info: ${modelName}`);
    console.log('─'.repeat(50));
    console.log(`  Family: ${data.details?.family || 'N/A'}`);
    console.log(`  Parameter Size: ${data.details?.parameter_size || 'N/A'}`);
    console.log(`  Quantization: ${data.details?.quantization_level || 'N/A'}`);
    console.log(`  Context Length: ${data.details?.context_length || 'N/A'}`);
    console.log('');
  } catch (error) {
    console.error('❌ Error showing model:', error);
  }
}

async function testModel(modelName: string, prompt: string): Promise<void> {
  try {
    console.log(`\n🧪 Testing: ${modelName}`);
    console.log(`   Prompt: "${prompt}"`);
    console.log('─'.repeat(50));
    
    const startTime = Date.now();
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
        prompt: prompt,
        stream: false,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
    
    const data: OllamaResponse = await response.json();
    const endTime = Date.now();
    
    console.log(`\n✅ Response:`);
    console.log(data.response);
    console.log('\n📊 Stats:');
    console.log(`  Total Duration: ${(data.total_duration / 1000000000).toFixed(2)}s`);
    console.log(`  Load Duration: ${(data.load_duration / 1000000000).toFixed(2)}s`);
    console.log(`  Prompt Tokens: ${data.prompt_eval_count}`);
    console.log(`  Completion Tokens: ${data.eval_count}`);
    console.log(`  Client Time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
    console.log('');
  } catch (error) {
    console.error('❌ Error testing model:', error);
  }
}

async function checkConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  console.log('🔍 Ollama Debug Tool');
  console.log(`   URL: ${OLLAMA_URL}`);
  console.log(`   Default Model: ${DEFAULT_MODEL}`);
  
  // Check connection
  const isConnected = await checkConnection();
  if (!isConnected) {
    console.error('\n❌ Cannot connect to Ollama!');
    console.error('   Make sure Ollama is running: ollama serve');
    console.error('   Or check OLLAMA_URL in your .env.local');
    process.exit(1);
  }
  console.log('   Status: ✅ Connected\n');
  
  // Parse arguments
  if (args.includes('--models') || args.length === 0) {
    await listModels();
  }
  
  if (args.includes('--show')) {
    const modelIndex = args.indexOf('--show');
    const modelName = args[modelIndex + 1] || DEFAULT_MODEL;
    await showModel(modelName);
  }
  
  if (args.includes('--test')) {
    const testIndex = args.indexOf('--test');
    const prompt = args[testIndex + 1] || 'Hello! How can I help you?';
    const modelName = args.includes('--model') 
      ? args[args.indexOf('--model') + 1] 
      : DEFAULT_MODEL;
    await testModel(modelName, prompt);
  }
  
  if (!args.includes('--models') && !args.includes('--show') && !args.includes('--test')) {
    await listModels();
    console.log('💡 Usage:');
    console.log('   npm run ollama:debug -- --models          # List all models');
    console.log('   npm run ollama:debug -- --show <model>     # Show model details');
    console.log('   npm run ollama:debug -- --test "prompt"    # Test with prompt');
    console.log('');
  }
}

main().catch(console.error);




