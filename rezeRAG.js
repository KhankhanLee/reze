// rezeRAG.js - 레제 지식 베이스 RAG 시스템 (JavaScript 버전)
// 웹 인터페이스에서 사용 가능

class RezeRAG {
    constructor() {
        this.knowledge = null;
        this.isLoaded = false;
    }

    // 지식 베이스 로드
    async loadKnowledge() {
        try {
            const response = await fetch('/reze_knowledge.txt');
            this.knowledge = await response.text();
            this.isLoaded = true;
            console.log('레제 지식 베이스 로드 완료');
        } catch (error) {
            console.error('지식 베이스 로드 실패:', error);
        }
    }

    // 간단한 키워드 검색
    search(query) {
        if (!this.isLoaded || !this.knowledge) {
            return '';
        }

        const lines = this.knowledge.split('\n');
        const results = [];
        const keywords = query.toLowerCase().split(' ');

        for (const line of lines) {
            if (keywords.some(keyword => line.toLowerCase().includes(keyword))) {
                results.push(line);
            }
        }

        return results.slice(0, 5).join('\n');
    }

    // 프롬프트 강화
    enhancePrompt(userMessage) {
        const relevantInfo = this.search(userMessage);

        if (relevantInfo) {
            return `[레제 관련 정보]
${relevantInfo}

[사용자 질문]
${userMessage}

위 정보를 참고하되, 레제답게 자연스럽게 대화하세요.`;
        }

        return userMessage;
    }
}

// 전역 RAG 인스턴스
const rezeRAG = new RezeRAG();

// 모듈로 내보내기 (ES6)
export { RezeRAG, rezeRAG };
