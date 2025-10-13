// core.js - Reze's Brain (v3)
// Reze's core AI logic - Chainsaw Man's Bomb Devil with a mysterious cafe girl charm
// Supports hybrid architecture of local models and cloud APIs

import { pipeline, env, AutoTokenizer, AutoModelForSpeechSeq2Seq } from './vendor/transformers.js';
import CloudAPIService from './cloudAPI.js';

// Local model configuration
env.allowLocalModels = true;
env.useBrowserCache = false;
env.allowRemoteModels = false;
env.backends.onnx.logLevel = 'verbose';
env.localModelPath = './models/';


class RezeAI {
    static instance = null;

    static async getInstance() {
        if (this.instance === null) {
            this.instance = new RezeAI();
            await this.instance.init();
        }
        return this.instance;
    }

    constructor() {
        this.cloudAPI = new CloudAPIService();
        this.useCloudAPI = false; // Default to using local model
        this.currentMode = 'casual'; // Chat modes: casual, assistant, creative
    }

    async init() {
        console.log('Initializing Reze\'s core AI...');
        
        // Priority loading of LLM model (chat functionality)
        try {
            console.log('Loading LLM model (LaMini-Flan-T5-77M with optimized prompts)...');
            this.llm = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-77M');
            console.log('✓ LLM model loaded successfully (LaMini with Reze personality).');
        } catch (error) {
            console.error('Failed to load LLM model:', error);
            // LLM loading failure doesn't block initialization
        }
        
        // Attempt to load ASR model (voice recognition)
        try {
            console.log('Loading ASR model...');
            const modelPath = 'Xenova/whisper-tiny';
            const tokenizer = await AutoTokenizer.from_pretrained(modelPath);
            const model = await AutoModelForSpeechSeq2Seq.from_pretrained(modelPath);
            this.asr = await pipeline('automatic-speech-recognition', model, { tokenizer });
            console.log('ASR model loaded successfully.');
        } catch (error) {
            console.warn('ASR model failed to load, voice recognition will be disabled:', error);
            // ASR loading failure doesn't affect chat functionality
            this.asr = null;
        }

        // TTS model temporarily disabled
        // try {
        //     console.log('Loading TTS model...');
        //     this.tts = await pipeline('text-to-speech', 'Xenova/speecht5_tts', { quantized: false });
        //     console.log('TTS model loaded successfully.');
        // } catch (error) {
        //     console.warn('TTS model failed to load, voice synthesis will be disabled:', error);
        //     this.tts = null;
        // }

        console.log('Reze\'s core AI initialized successfully.');
    }

    async think(prompt) {
        try {
            // If cloud API is enabled and configured, use it as priority
            if (this.useCloudAPI && this.cloudAPI.isConfigured()) {
                return await this.thinkWithCloudAPI(prompt);
            }
            
            // Otherwise use local model
            return await this.thinkWithLocalModel(prompt);
            
        } catch (error) {
            console.error('Error during thinking process:', error);
            
            // If cloud API fails, try falling back to local model
            if (this.useCloudAPI) {
                console.log('Cloud API failed, falling back to local model...');
                try {
                    return await this.thinkWithLocalModel(prompt);
                } catch (localError) {
                    console.error('Local model also failed:', localError);
                }
            }
            
            return this.getErrorResponse();
        }
    }

    // Think using cloud API
    async thinkWithCloudAPI(prompt) {
        const enhancedPrompt = this.enhancePromptForMode(prompt);
        return await this.cloudAPI.chat(enhancedPrompt);
    }

    // Think using local model with optimized LLM parameters and processing
    async thinkWithLocalModel(prompt) {
        if (!this.llm) {
            return "I'm still waking up... give me a moment.";
        }
        
        const rezePrompt = this.enhancePromptForMode(prompt, true);
        
        // Optimized for LaMini-Flan-T5-77M - VERY SHORT responses work best
        const result = await this.llm(rezePrompt, {
            max_new_tokens: 50,   // SHORT responses only for this small model
            temperature: 0.8,     // Higher temperature for personality
            top_k: 40,            
            top_p: 0.9,          
            do_sample: true,      
            repetition_penalty: 1.3, // Avoid repetition
        });
        
        // Enhanced text cleaning
        let response = result[0].generated_text;
        
        // Remove prompt and common prefixes
        response = response.replace(rezePrompt, '').trim();
        response = response.replace(/^(Reze:|Response:|Answer:)/i, '').trim();
        response = response.split('\n')[0]; // Take only first line
        
        // If response is empty or too short, use personality-appropriate fallback
        if (!response || response.length < 3) {
            const rezeBackups = [
                "Hmm... interesting question.",
                "Let me think about that...",
                "That's... complicated.",
                "Privet... what do you mean exactly?",
                "Tell me more about that."
            ];
            return rezeBackups[Math.floor(Math.random() * rezeBackups.length)];
        }
        
        // Limit length (small model tends to ramble)
        if (response.length > 150) {
            response = response.substring(0, 150).split(' ').slice(0, -1).join(' ') + '...';
        }
        
        return response;
    }

    // Enhance prompts based on mode, using advanced LLM prompt engineering
    enhancePromptForMode(prompt, isLocal = false) {
        if (!isLocal) {
            // Cloud API uses its own system prompt
            return prompt;
        }
        
        // Optimized for LaMini-Flan-T5-77M (small model, needs simple prompts)
        // Keep it SHORT and DIRECT - this model works best with brief instructions
        return `You are Reze, a mysterious Russian girl. Respond in 1 short sentence, be cool and slightly teasing. User asks: ${prompt}\nReze:`;
    }

    // Get error response
    getErrorResponse() {
        const errorResponses = [
            "I'm sorry, I'm having trouble processing that right now. Let me try to reorganize my thoughts...",
            "Hmm... I need to think about this a bit more. Please wait a moment.",
            "I seem to be having a bit of trouble with that. Give me a second to sort things out.",
            "Let me rephrase my thoughts. Just a moment please.",
            "I didn't quite catch that. Could you try asking in a different way?"
        ];
        
        return errorResponses[Math.floor(Math.random() * errorResponses.length)];
    }

    // Set chat mode
    setChatMode(mode) {
        if (['casual', 'assistant', 'creative'].includes(mode)) {
            this.currentMode = mode;
            return true;
        }
        return false;
    }

    // Switch AI service provider
    switchProvider(provider) {
        if (provider === 'local') {
            this.useCloudAPI = false;
            return true;
        } else {
            const success = this.cloudAPI.switchProvider(provider);
            if (success) {
                this.useCloudAPI = true;
            }
            return success;
        }
    }

    // Set API key
    setAPIKey(provider, apiKey) {
        return this.cloudAPI.setAPIKey(provider, apiKey);
    }

    // Clear conversation history
    clearHistory() {
        this.cloudAPI.clearHistory();
    }

    // Get current configuration
    getCurrentConfig() {
        return {
            useCloudAPI: this.useCloudAPI,
            provider: this.useCloudAPI ? this.cloudAPI.getCurrentProvider() : { name: 'local', model: 'LaMini-Flan-T5-77M' },
            mode: this.currentMode,
            isConfigured: this.useCloudAPI ? this.cloudAPI.isConfigured() : true
        };
    }

    // Process audio input
    async listen(audioData) {
        if (!this.asr) {
            throw new Error('Speech recognition model not initialized');
        }
        const result = await this.asr(audioData);
        return result.text;
    }

    // Generate speech from text
    async speak(text) {
        if (!this.tts) {
            throw new Error('Speech synthesis model not initialized');
        }
        // We need speaker embeddings for SpeechT5
        const speaker_embeddings = 'models/Xenova/speecht5_tts/speaker_embeddings.bin';
        const result = await this.tts(text, {
            speaker_embeddings,
        });
        return result.audio;
    }

    // Get cloud API service instance (for external access)
    getCloudAPIService() {
        return this.cloudAPI;
    }
}

// ES6 module export
export { RezeAI };