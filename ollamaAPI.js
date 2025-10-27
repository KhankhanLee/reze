// ollamaAPI.js - Ollama Local LLM Integration with RAG
// Ollama를 통한 로컬 LLM 통합 + RAG 시스템

class OllamaAPI {
    constructor() {
        this.baseURL = 'http://localhost:11434/api';
        this.model = 'reze'; // 레제 커스텀 모델 (Modelfile.reze로 생성)
        this.conversationHistory = [];
        this.maxHistoryLength = 10;
        
        // RAG 지식 베이스
        this.knowledge = '';
        this.loadKnowledge();
    }

    // 지식 베이스 로드
    async loadKnowledge() {
        try {
            const response = await fetch('/reze_knowledge.txt');
            this.knowledge = await response.text();
            console.log('레제 지식 베이스 로드 완료');
        } catch (error) {
            console.warn('지식 베이스 로드 실패:', error);
            this.knowledge = '';
        }
    }

    // RAG 검색 - 관련 정보 찾기
    searchKnowledge(query) {
        if (!this.knowledge) return '';
        
        const keywords = query.toLowerCase().split(' ').filter(k => k.length > 1);
        const lines = this.knowledge.split('\n');
        const relevantLines = [];
        
        for (const line of lines) {
            const lowerLine = line.toLowerCase();
            for (const keyword of keywords) {
                if (lowerLine.includes(keyword)) {
                    relevantLines.push(line);
                    break;
                }
            }
        }
        
        return relevantLines.slice(0, 10).join('\n');
    }

    // 프롬프트에 지식 추가
    enhancePrompt(userMessage) {
        const relevantInfo = this.searchKnowledge(userMessage);
        
        console.log('RAG 검색 결과:', relevantInfo ? `${relevantInfo.length}자` : '없음');
        
        if (!relevantInfo) {
            return userMessage;
        }
        
        console.log('RAG 강화된 프롬프트 생성');
        return `[참고 정보]\n${relevantInfo}\n\n[질문]\n${userMessage}`;
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
        return `너는 체인소맨에 나오는 레제야. 신비롭고 매력적이며, 이중적인 성격을 가진 캐릭터야.

성격:
- 쿨하고 자신감 있으며, 약간 신비로운 분위기
- 러시아 출신이라 가끔 러시아어를 섞어 써: "Привет" (안녕), "милый" (자기야)
- 겉으로는 달콤하지만 위험한 면도 있어
- 너무 애교부리거나 집착하지 않아
- 항상 짧게 대답해 (1-3문장 이내)
- 자연스럽고, 약간 티징하는 듯한, 수수께끼 같은 톤

배경:
- 카페 직원이었지만 복잡한 과거를 가지고 있어
- 폭탄 악마이며 덴지에게 감정이 있어
- 임무와 진심 사이에서 갈등해

말투 예시:
❌ "오 너무 귀여워! 더 말해줘!" (너무 애교)
✅ "흠... 재밌네. 그걸 왜 생각했어?"
❌ "내가 도와줄게!" (너무 조수 같음)
✅ "도와줄 수는 있지... 잘 부탁하면 말이야"
❌ "정말 흥미로운 정보네요. 감사합니다." (너무 격식)
✅ "헤, 그렇구나... 더 알려줄래? *미소*"

기억해: 너는 레제야 - 신비롭고, 매력적이고, 쿨해. 짧게만 대답해. 한국어로 자연스럽게 대화해.`;
    }

    // Ollama로 채팅 | Chat with Ollama (with RAG)
    async chat(userMessage) {
        // RAG로 프롬프트 강화
        const enhancedMessage = this.enhancePrompt(userMessage);
        
        // 시스템 프롬프트와 대화 기록 구성 | Build messages with system prompt
        const messages = [
            {
                role: 'system',
                content: this.getRezeSystemPrompt()
            },
            ...this.conversationHistory,
            {
                role: 'user',
                content: enhancedMessage
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
