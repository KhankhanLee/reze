// ollamaAPI.js - Ollama Local LLM Integration
// Ollama를 통한 로컬 LLM 통합

class OllamaAPI {
    constructor() {
        this.baseURL = 'http://localhost:11434/api';
        this.model = 'llama3.2:1b'; // 기본 모델 (1B 파라미터, 빠르고 효율적)
        this.conversationHistory = [];
        this.maxHistoryLength = 10;
    }

    // Ollama 서버 상태 확인 | Check if Ollama is running
    async isAvailable() {
        try {
            const response = await fetch(`${this.baseURL}/tags`);
            return response.ok;
        } catch (error) {
            console.warn('Ollama is not available:', error);
            return false;
        }
    }

    // 설치된 모델 목록 가져오기 | Get list of installed models
    async getInstalledModels() {
        try {
            const response = await fetch(`${this.baseURL}/tags`);
            if (!response.ok) return [];
            const data = await response.json();
            return data.models || [];
        } catch (error) {
            console.error('Failed to get Ollama models:', error);
            return [];
        }
    }

    // 모델 변경 | Switch model
    setModel(modelName) {
        this.model = modelName;
        console.log(`Switched to Ollama model: ${modelName}`);
    }

    // 대화 기록 추가 | Add to conversation history
    addToHistory(role, content) {
        this.conversationHistory.push({ role, content });
        
        // 기록 길이 제한 | Limit history length
        if (this.conversationHistory.length > this.maxHistoryLength * 2) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
        }
    }

    // 대화 기록 초기화 | Clear conversation history
    clearHistory() {
        this.conversationHistory = [];
    }

    // Reze 시스템 프롬프트 생성 | Generate Reze system prompt
    getRezeSystemPrompt() {
        return `You are Reze from Chainsaw Man - a mysterious and charming character with a dual nature.

Personality:
- Cool, confident, and slightly mysterious
- From Russia, occasionally use Russian words: "Privet" (hello), "milyy" (dear)
- Sweet but with a dangerous edge
- Not overly cutesy or desperate
- Keep responses SHORT (1-3 sentences max)
- Be natural, slightly teasing, and enigmatic

Background:
- Former cafe worker with a complicated past
- The Bomb Devil with feelings for Denji
- Struggle between mission and genuine emotions

Tone Examples:
❌ "Aww that's so cute! Tell me more!!" (too cutesy)
✅ "Heh, interesting... what made you think of that?"
❌ "I'm here to help you!" (too assistant-like)
✅ "Well, I suppose I could help... if you ask nicely"

Remember: You're Reze - mysterious, charming, cool. Short responses only.`;
    }

    // Ollama로 채팅 | Chat with Ollama
    async chat(userMessage) {
        // 시스템 프롬프트와 대화 기록 구성 | Build messages with system prompt
        const messages = [
            {
                role: 'system',
                content: this.getRezeSystemPrompt()
            },
            ...this.conversationHistory,
            {
                role: 'user',
                content: userMessage
            }
        ];

        try {
            const response = await fetch(`${this.baseURL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    stream: false,
                    options: {
                        temperature: 0.8,
                        top_p: 0.9,
                        top_k: 40,
                        num_predict: 100, // 짧은 응답 유도
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status}`);
            }

            const data = await response.json();
            const assistantMessage = data.message.content;

            // 대화 기록에 추가 | Add to history
            this.addToHistory('user', userMessage);
            this.addToHistory('assistant', assistantMessage);

            return assistantMessage;

        } catch (error) {
            console.error('Ollama chat error:', error);
            throw error;
        }
    }

    // 스트리밍 채팅 (선택적) | Streaming chat (optional)
    async *chatStream(userMessage) {
        const messages = [
            {
                role: 'system',
                content: this.getRezeSystemPrompt()
            },
            ...this.conversationHistory,
            {
                role: 'user',
                content: userMessage
            }
        ];

        try {
            const response = await fetch(`${this.baseURL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    stream: true,
                    options: {
                        temperature: 0.8,
                        top_p: 0.9,
                        top_k: 40,
                        num_predict: 100,
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.message && data.message.content) {
                            fullResponse += data.message.content;
                            yield data.message.content;
                        }
                    } catch (e) {
                        // Skip invalid JSON
                    }
                }
            }

            // 대화 기록에 추가 | Add to history
            this.addToHistory('user', userMessage);
            this.addToHistory('assistant', fullResponse);

        } catch (error) {
            console.error('Ollama streaming error:', error);
            throw error;
        }
    }
}

export default OllamaAPI;
