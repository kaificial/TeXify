import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';

async function listModels() {
    // Read key from .env
    const envFile = fs.readFileSync('.env', 'utf-8');
    const keyMatch = envFile.match(/ANTHROPIC_API_KEY=(.+)/);
    if (!keyMatch) {
        console.error('No key found in .env');
        return;
    }
    
    const client = new Anthropic({ apiKey: keyMatch[1].trim() });
    
    try {
        const response = await client.models.list();
        console.log('Available models:');
        response.data.forEach(m => console.log(`- ${m.id}`));
    } catch (e) {
        console.error('Failed to list models:', e);
    }
}

listModels();
