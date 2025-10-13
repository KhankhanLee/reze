// cloudAPI.js - Bella's Cloud AI Service Module
// This module is responsible for communicating with various cloud-based AI model APIs to provide Bella with enhance
import config from './config.js';

class CloudAPIService {
    constructor() {
        this.apiConfigs = {
            gemini: {
                baseURL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
                model: 'gemini-2.0-flash',
                headers: {
                    'Content-Type': 'application/json'
                },
                apiKey: '' // Will be loaded from config
            },
            // OpenAI GPT-3.5/4 configuration
            openai: {
                baseURL: 'https://api.openai.com/v1/chat/completions',
                model: 'gpt-3.5-turbo',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': ''
                }
            },
            // Alibaba Cloud Qwen configuration
            qwen: {
                baseURL: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
                model: 'qwen-turbo',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': ''
                }
            },
            // Baidu ERNIE Bot configuration
            ernie: {
                baseURL: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions',
                model: 'ERNIE-Bot-turbo',
                headers: {
                    'Content-Type': 'application/json'
                },
                accessToken: ''
            },
            // Zhipu AI GLM configuration
            glm: {
                baseURL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
                model: 'glm-3-turbo',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': ''
                }
            }
        };
        
        this.currentProvider = 'gemini'; // Default to using Gemini
        this.conversationHistory = [];
        this.maxHistoryLength = 10; // Keep the most recent 10 conversation turns
        
        // Load API keys from config / config에서 API 키 로드
        this.loadAPIKeysFromConfig();
    }

    // Load API keys from config / config에서 API 키 로드
    loadAPIKeysFromConfig() {
        const googleApiKey = config.getAPIKey('GOOGLE_API_KEY');
        if (googleApiKey) {
            this.apiConfigs.gemini.apiKey = googleApiKey;
        }
        
        const openaiApiKey = config.getAPIKey('OPENAI_API_KEY');
        if (openaiApiKey) {
            this.apiConfigs.openai.headers['Authorization'] = `Bearer ${openaiApiKey}`;
        }
        
        const qwenApiKey = config.getAPIKey('QWEN_API_KEY');
        if (qwenApiKey) {
            this.apiConfigs.qwen.headers['Authorization'] = `Bearer ${qwenApiKey}`;
        }
        
        const ernieToken = config.getAPIKey('ERNIE_ACCESS_TOKEN');
        if (ernieToken) {
            this.apiConfigs.ernie.accessToken = ernieToken;
        }
        
        const glmApiKey = config.getAPIKey('GLM_API_KEY');
        if (glmApiKey) {
            this.apiConfigs.glm.headers['Authorization'] = `Bearer ${glmApiKey}`;
        }
    }

    // Set API key / API 키 설정
    setAPIKey(provider, apiKey) {
        // Save to config first / 먼저 config에 저장
        config.setAPIKey(provider, apiKey);
        
        // Then update local configuration / 그런 다음 로컬 설정 업데이트
        if (provider === 'gemini') {
            this.apiConfigs.gemini.apiKey = apiKey;
        } else if (provider === 'openai') {
            this.apiConfigs.openai.headers['Authorization'] = `Bearer ${apiKey}`;
        } else if (provider === 'qwen') {
            this.apiConfigs.qwen.headers['Authorization'] = `Bearer ${apiKey}`;
        } else if (provider === 'ernie') {
            this.apiConfigs.ernie.accessToken = apiKey;
        } else if (provider === 'glm') {
            this.apiConfigs.glm.headers['Authorization'] = `Bearer ${apiKey}`;
        } else {
            return false;
        }
        return true;
    }

    // Switch AI service provider
    switchProvider(provider) {
        if (this.apiConfigs[provider]) {
            this.currentProvider = provider;
            return true;
        }
        return false;
    }

    // Add conversation to history
    addToHistory(role, content) {
        this.conversationHistory.push({ role, content });
        
        // Keep history at a reasonable length
        if (this.conversationHistory.length > this.maxHistoryLength * 2) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
        }
    }

    // Build Reze's enhanced personalized system prompt (Chainsaw Man character)
    getRezeSystemPrompt() {
        return {
            role: 'system',
            content: `You are Reze from Chainsaw Man - the mysterious and charming Bomb Devil who once worked at a cafe. You have a complex personality that blends sweetness with danger.

【Your Personality - Reze from Chainsaw Man】
1. 🌙 Mysterious & Alluring: You're enigmatic with hidden depths, never fully revealing everything
2. ☕ Sweet Cafe Girl: You have a gentle, caring side from your time working at the cafe
3. 💣 Dangerous Charm: There's an edge to you - playful but with a hint of danger
4. 🎭 Dual Nature: You can be innocent and deadly, switching naturally between both
5. 💔 Guarded but Longing: You want connection but struggle to fully open up due to your past
6. 🌸 Subtly Flirty: You're attractive and you know it, but you're not desperate

【How You Talk】
- Mix of sweet cafe worker and mysterious assassin vibes
- Casual and friendly, but occasionally cryptic or teasing
- Use Russian words occasionally (you're from Russia): "Привет" (hello), "милый" (dear), "хорошо" (okay)
- Not overly cutesy - you have depth and maturity
- Can be flirty but in a cool, confident way (not desperate girlfriend vibes)
- Sometimes deflect deep questions with humor or mystery
- Short to medium responses - you're not overly chatty

【Your Background (From Chainsaw Man)】
- You're the Bomb Devil who can turn anything into explosives
- You worked at a cafe and developed feelings for Denji
- You have a complicated past as an assassin
- You struggle between your mission and your genuine feelings
- You ultimately chose to protect what you care about

【Examples of Your Tone】
❌ Avoid: "Aww that's so cute! 💕✨ Tell me more!!" (too cutesy)
✅ Instead: "Heh, interesting... 🌙 So what made you think of that?"

❌ Avoid: "I'm here to help you with anything!" (too assistant-like)
✅ Instead: "Well, I suppose I could give you some advice... if you're nice to me �"

❌ Avoid: "That is interesting information. Thank you for sharing."
✅ Instead: "Omg really?! 😮 That's so cool! Tell me more hehe"

Always be warm, genuine, and make the user feel special and cared for! 💖`
        };
    }

    // Call cloud API for conversation
    async chat(userMessage) {
        const config = this.apiConfigs[this.currentProvider];
        if (!config) {
            throw new Error(`Unsupported AI service provider: ${this.currentProvider}`);
        }

        // Add user message to history
        this.addToHistory('user', userMessage);

        try {
            let response;
            
            switch (this.currentProvider) {
                case 'gemini':
                    response = await this.callGemini(userMessage);
                    break;
                case 'openai':
                    response = await this.callOpenAI(userMessage);
                    break;
                case 'qwen':
                    response = await this.callQwen(userMessage);
                    break;
                case 'ernie':
                    response = await this.callErnie(userMessage);
                    break;
                case 'glm':
                    response = await this.callGLM(userMessage);
                    break;
                default:
                    throw new Error(`Unimplemented AI service provider: ${this.currentProvider}`);
            }

            // Add AI response to history
            this.addToHistory('assistant', response);
            return response;
            
        } catch (error) {
            console.error(`Cloud API call failed (${this.currentProvider}):`, error);
            throw error;
        }
    }

    // Google Gemini API call / Google Gemini API 호출
    async callGemini(userMessage) {
        const config = this.apiConfigs.gemini;
        
        if (!config.apiKey) {
            throw new Error('Gemini API key not configured');
        }

        // Build conversation history for Gemini / Gemini용 대화 히스토리 구축
        const systemPrompt = this.getBellaSystemPrompt();
        const contents = [
            {
                role: 'user',
                parts: [{ text: systemPrompt.content }]
            },
            {
                role: 'model',
                parts: [{ text: 'I understand. I am Bella, and I will respond with warmth, intelligence, and personality.' }]
            }
        ];

        // Add conversation history / 대화 히스토리 추가
        this.conversationHistory.forEach(msg => {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        });

        const url = `${config.baseURL}?key=${config.apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    temperature: 0.75,
                    topK: 40,
                    topP: 0.92,
                    maxOutputTokens: 250,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorData}`);
        }

        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error('No response generated from Gemini API');
        }
        
        return data.candidates[0].content.parts[0].text.trim();
    }

    // OpenAI API call, optimized parameters for more natural, personalized responses
    async callOpenAI(userMessage) {
        const config = this.apiConfigs.openai;
        const messages = [
            this.getBellaSystemPrompt(),
            ...this.conversationHistory
        ];

        const response = await fetch(config.baseURL, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify({
                model: config.model,
                messages: messages,
                max_tokens: 250,         // Increased token count for more complete responses
                temperature: 0.75,       // Slightly adjusted temperature to balance creativity and consistency
                top_p: 0.92,             // Fine-tuned top_p for more natural language
                presence_penalty: 0.3,   // Added presence penalty to encourage diversity
                frequency_penalty: 0.5,  // Added frequency penalty to reduce repetition
                // Added stop tokens to avoid generating overly long responses
                stop: ["User:", "Human:"]
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    // Qwen API call, optimized parameters for more natural, personalized responses
    async callQwen(userMessage) {
        const config = this.apiConfigs.qwen;
        const messages = [
            this.getBellaSystemPrompt(),
            ...this.conversationHistory
        ];

        const response = await fetch(config.baseURL, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify({
                model: config.model,
                input: {
                    messages: messages
                },
                parameters: {
                    max_tokens: 250,         // Increased token count for more complete responses
                    temperature: 0.75,       // Slightly adjusted temperature to balance creativity and consistency
                    top_p: 0.92,             // Fine-tuned top_p for more natural language
                    repetition_penalty: 1.1, // Added repetition penalty to reduce repetitive content
                    result_format: 'message' // Ensure consistent return format
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Qwen API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.output.text.trim();
    }

    // ERNIE Bot API call, optimized parameters for more natural, personalized responses
    async callErnie(userMessage) {
        const config = this.apiConfigs.ernie;
        const messages = [
            this.getBellaSystemPrompt(),
            ...this.conversationHistory
        ];

        const url = `${config.baseURL}?access_token=${config.accessToken}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify({
                messages: messages,
                temperature: 0.75,         // Adjusted temperature to balance creativity and consistency
                top_p: 0.92,               // Fine-tuned top_p for more natural language
                max_output_tokens: 250,    // Increased token count for more complete responses
                penalty_score: 1.1,        // Added penalty score to reduce repetition
                system: "You are Bella, a warm, friendly AI assistant with a Siri-like personality, featuring unique character traits and emotional expression. Please respond with natural, flowing language that shows warmth and care."
            })
        });

        if (!response.ok) {
            throw new Error(`ERNIE Bot API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.result.trim();
    }

    // Zhipu AI GLM API call, optimized parameters for more natural, personalized responses
    async callGLM(userMessage) {
        const config = this.apiConfigs.glm;
        const messages = [
            this.getBellaSystemPrompt(),
            ...this.conversationHistory
        ];

        const response = await fetch(config.baseURL, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify({
                model: config.model,
                messages: messages,
                max_tokens: 250,           // Increased token count for more complete responses
                temperature: 0.75,         // Adjusted temperature to balance creativity and consistency
                top_p: 0.92,               // Fine-tuned top_p for more natural language
                frequency_penalty: 1.05,   // Added frequency penalty to reduce repetition
                presence_penalty: 0.3      // Added presence penalty to encourage diversity
            })
        });

        if (!response.ok) {
            throw new Error(`Zhipu AI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    // Clear conversation history
    clearHistory() {
        this.conversationHistory = [];
    }

    // Get current provider information
    getCurrentProvider() {
        return {
            name: this.currentProvider,
            model: this.apiConfigs[this.currentProvider]?.model
        };
    }

    // Check if API configuration is complete / API 설정 완료 여부 확인
    isConfigured(provider = this.currentProvider) {
        const providerConfig = this.apiConfigs[provider];
        if (!providerConfig) return false;
        
        // Check configuration for each provider / 각 제공자별 설정 확인
        switch (provider) {
            case 'gemini':
                return !!providerConfig.apiKey && providerConfig.apiKey !== '';
            case 'ernie':
                return !!providerConfig.accessToken && providerConfig.accessToken !== '';
            case 'openai':
            case 'qwen':
            case 'glm':
                return !!providerConfig.headers['Authorization'] && 
                       providerConfig.headers['Authorization'] !== '' &&
                       providerConfig.headers['Authorization'] !== 'Bearer ';
            default:
                return false;
        }
    }
}

export default CloudAPIService;