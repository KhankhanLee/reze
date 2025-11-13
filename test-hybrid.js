// 하이브리드 시스템 테스트
import HybridChatSystem from './hybridChat.js';

const hybrid = new HybridChatSystem();

async function testHybridSystem() {
    const testMessages = [
        // 간단한 메시지들 (Fine-tuned가 처리)
        "안녕",
        "뭐해",
        "사랑해",
        "피곤해",
        
        // 복잡한 메시지들 (Ollama로 백업)
        "한국의 전통 음식에 대해 자세히 설명해줘",
        "오늘 날씨가 좋은데 나가서 뭘 하면 좋을까? 추천해줘",
        "인공지능이 미래 사회에 미칠 영향을 분석해달라고",
        "스트레스 해소 방법을 여러 개 알려주고 각각의 장단점도 설명해줘"
    ];

    console.log("=== 하이브리드 채팅 시스템 테스트 ===\n");

    for (const message of testMessages) {
        console.log(`사용자: ${message}`);
        
        const result = await hybrid.smartChat(message);
        
        console.log(`레제: ${result.response}`);
        console.log(`소스: ${result.source} | 품질: ${(result.quality || 0).toFixed(2)} | 시간: ${result.responseTime}ms\n`);
        
        // 다음 테스트 전 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// 테스트 실행 함수
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
    testHybridSystem().catch(console.error);
}