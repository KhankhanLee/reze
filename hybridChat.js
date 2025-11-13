// hybridChat.js - 스마트 하이브리드 채팅 시스템
// Fine-tuned 모델(기본) + Ollama(확장) 조합

class HybridChatSystem {
    constructor() {
        this.primaryMode = 'finetuned'; // 'finetuned' | 'ollama'
        this.fallbackEnabled = true;
        this.responseCache = new Map();
    }

    // 메시지 복잡도 분석
    analyzeComplexity(message) {
        const indicators = {
            simple: [
                message.length < 20,                    // 짧은 메시지
                /^(안녕|뭐|왜|어떻게|언제|어디)/.test(message), // 간단한 질문
                /^(사랑|좋아|싫어|피곤|행복)/.test(message),    // 감정 표현
                /(해|어|지)(\?|$)/.test(message)         // 간단한 종결
            ],
            complex: [
                message.length > 50,                     // 긴 메시지
                /설명|분석|비교|추천|계획/.test(message),     // 복잡한 요청
                message.includes('왜냐하면'),              // 논리적 설명
                /^\w+은 \w+이고/.test(message),          // 복잡한 문장 구조
                message.split(' ').length > 8            // 많은 단어
            ]
        };

        const simpleScore = indicators.simple.filter(Boolean).length;
        const complexScore = indicators.complex.filter(Boolean).length;
        
        return {
            isSimple: simpleScore > complexScore,
            confidence: Math.abs(simpleScore - complexScore) / 4
        };
    }

    // 응답 품질 평가
    evaluateResponse(message, response) {
        return {
            relevance: this.checkRelevance(message, response),
            naturalness: this.checkNaturalness(response),
            completeness: this.checkCompleteness(message, response)
        };
    }

    checkRelevance(message, response) {
        // 간단한 키워드 매칭으로 관련성 체크
        const msgWords = message.toLowerCase().split(' ');
        const respWords = response.toLowerCase().split(' ');
        const overlap = msgWords.filter(w => respWords.includes(w)).length;
        return overlap / Math.max(msgWords.length, 1);
    }

    checkNaturalness(response) {
        // 자연스러움 점수 (길이, 문법, 레제 스타일)
        const naturalIndicators = [
            response.length > 3 && response.length < 100,  // 적당한 길이
            !response.includes('...'),                     // 미완성 감소
            /[가-힣]/.test(response),                      // 한국어 포함
            !/(.)\1{3,}/.test(response)                   // 반복 패턴 없음
        ];
        return naturalIndicators.filter(Boolean).length / naturalIndicators.length;
    }

    checkCompleteness(message, response) {
        // 완성도 체크
        if (message.includes('?') && !response.includes('?') && response.length > 5) {
            return 0.8; // 질문에 대한 답변
        }
        return response.length > 10 ? 0.7 : 0.3;
    }

    // Fine-tuned 모델 호출
    async callFinetunedModel(message) {
        try {
            const response = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            
            const data = await response.json();
            return {
                success: true,
                response: data.response,
                source: 'finetuned',
                responseTime: Date.now()
            };
        } catch (error) {
            console.error('Fine-tuned model error:', error);
            return { success: false, error: error.message };
        }
    }

    // Ollama 모델 호출 (백업)
    async callOllamaModel(message) {
        try {
            // OllamaAPI 인스턴스 사용
            const ollama = new OllamaAPI();
            const isAvailable = await ollama.isAvailable();
            
            if (!isAvailable) {
                throw new Error('Ollama not available');
            }
            
            const response = await ollama.chat(message);
            return {
                success: true,
                response: response,
                source: 'ollama',
                responseTime: Date.now()
            };
        } catch (error) {
            console.error('Ollama model error:', error);
            return { success: false, error: error.message };
        }
    }

    // 스마트 라우팅
    async smartChat(message) {
        const startTime = Date.now();
        
        // 1. 복잡도 분석
        const complexity = this.analyzeComplexity(message);
        console.log(`메시지 복잡도: ${complexity.isSimple ? '간단' : '복잡'} (신뢰도: ${complexity.confidence})`);

        // 2. 캐시 확인
        const cacheKey = message.toLowerCase().trim();
        if (this.responseCache.has(cacheKey)) {
            console.log('캐시된 응답 사용');
            return this.responseCache.get(cacheKey);
        }

        let result;

        // 3. 주 모델 시도 (Fine-tuned 우선)
        if (complexity.isSimple || this.primaryMode === 'finetuned') {
            console.log('Fine-tuned 모델 사용');
            result = await this.callFinetunedModel(message);
            
            // 품질 평가
            if (result.success) {
                const quality = this.evaluateResponse(message, result.response);
                const overallQuality = (quality.relevance + quality.naturalness + quality.completeness) / 3;
                
                console.log(`Fine-tuned 품질 점수: ${overallQuality.toFixed(2)}`);
                
                // 품질이 충분하면 그대로 반환
                if (overallQuality > 0.6) {
                    result.quality = overallQuality;
                    result.responseTime = Date.now() - startTime;
                    this.responseCache.set(cacheKey, result);
                    return result;
                }
            }
        }

        // 4. 백업 모델 시도 (Ollama)
        if (this.fallbackEnabled && (!result || !result.success || result.quality < 0.6)) {
            console.log('Ollama 백업 모델 사용');
            const ollamaResult = await this.callOllamaModel(message);
            
            if (ollamaResult.success) {
                const quality = this.evaluateResponse(message, ollamaResult.response);
                ollamaResult.quality = (quality.relevance + quality.naturalness + quality.completeness) / 3;
                ollamaResult.responseTime = Date.now() - startTime;
                
                console.log(`Ollama 품질 점수: ${ollamaResult.quality.toFixed(2)}`);
                
                // Fine-tuned 결과와 비교하여 더 좋은 것 선택
                if (!result || !result.success || ollamaResult.quality > result.quality) {
                    this.responseCache.set(cacheKey, ollamaResult);
                    return ollamaResult;
                }
            }
        }

        // 5. 최종 결과 반환
        if (result && result.success) {
            result.responseTime = Date.now() - startTime;
            this.responseCache.set(cacheKey, result);
            return result;
        }

        // 6. 모든 시도 실패 시 기본 응답
        return {
            success: true,
            response: "흠... 잘 모르겠어. 다른 말을 해봐.",
            source: 'fallback',
            quality: 0.3,
            responseTime: Date.now() - startTime
        };
    }
}

export default HybridChatSystem;