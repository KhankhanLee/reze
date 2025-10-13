// download_phi.js
// Download Phi-3.5-mini-instruct model files directly from HuggingFace

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MODEL_DIR = path.join(__dirname, 'models/Xenova/Phi-3.5-mini-instruct');
const BASE_URL = 'https://huggingface.co/Xenova/Phi-3.5-mini-instruct/resolve/main';

// Essential files for the model
const FILES_TO_DOWNLOAD = [
    'config.json',
    'generation_config.json',
    'tokenizer.json',
    'tokenizer_config.json',
    'special_tokens_map.json',
    'onnx/model_q4.onnx',
    'onnx/model_q4.onnx_data'
];

async function downloadFile(url, filepath) {
    console.log(`Downloading: ${path.basename(filepath)}...`);
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download ${url}: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, Buffer.from(buffer));
    
    const sizeMB = (buffer.byteLength / (1024 * 1024)).toFixed(2);
    console.log(`✓ Downloaded ${path.basename(filepath)} (${sizeMB} MB)`);
}

async function main() {
    console.log('Starting Phi-3.5-mini-instruct model download...\n');
    
    await fs.mkdir(MODEL_DIR, { recursive: true });
    
    let totalSize = 0;
    
    for (const file of FILES_TO_DOWNLOAD) {
        const url = `${BASE_URL}/${file}`;
        const filepath = path.join(MODEL_DIR, file);
        
        try {
            await downloadFile(url, filepath);
        } catch (error) {
            console.error(`Error downloading ${file}:`, error.message);
            console.log('Continuing with next file...\n');
        }
    }
    
    console.log('\n✓ Phi-3.5-mini-instruct model download complete!');
    console.log(`Model saved to: ${MODEL_DIR}`);
}

main().catch(console.error);
