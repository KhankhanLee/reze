# 레제 AI RAG 시스템 가이드
> Retrieval-Augmented Generation으로 레제 지식 강화하기

## 📚 RAG란?

**RAG (Retrieval-Augmented Generation)**은 외부 지식을 검색해서 AI 응답에 활용하는 기술이에요.

### 장점:
- ✅ 모델 재학습 불필요
- ✅ 정확한 정보 제공
- ✅ 쉽게 업데이트 가능
- ✅ 환각(hallucination) 감소

---

## 🎯 레제 AI에 적용하기

### 방법 1: 간단한 텍스트 검색 (이미 구현됨!)

**파일 구조:**
```
reze/
├── reze_knowledge.txt    # 레제 지식 베이스
├── rezeRAG.js            # JavaScript RAG 시스템
└── rag_reze.py           # Python RAG 시스템 (선택)
```

**사용법:**
```javascript
// 1. RAG 초기화
import { rezeRAG } from './rezeRAG.js';
await rezeRAG.loadKnowledge();

// 2. 사용자 메시지 강화
const userMessage = "레제 너 어디 출신이야?";
const enhanced = rezeRAG.enhancePrompt(userMessage);

// 3. Ollama에 전달
const response = await ollamaAPI.chat(enhanced);
```

---

### 방법 2: 나무위키 크롤링 + RAG (고급)

#### 1단계: 나무위키 데이터 수집

```python
# crawl_namuwiki.py
import requests
from bs4 import BeautifulSoup

def crawl_reze_namuwiki():
    """나무위키 레제 문서 크롤링"""
    url = "https://namu.wiki/w/레제(체인소맨)"
    
    # 주의: 나무위키는 크롤링 정책 확인 필요
    # robots.txt 준수하기
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    }
    
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # 본문 추출
    content = soup.find('div', {'class': 'wiki-content'})
    
    if content:
        text = content.get_text(strip=True, separator='\\n')
        
        # 저장
        with open('reze_knowledge_extended.txt', 'w', encoding='utf-8') as f:
            f.write(text)
        
        print("✅ 나무위키 데이터 수집 완료")
    else:
        print("❌ 데이터 수집 실패")

if __name__ == "__main__":
    crawl_reze_namuwiki()
```

**법적 주의사항:**
- ⚠️ 나무위키 이용약관 확인 필수
- ⚠️ 개인적 용도로만 사용
- ⚠️ 크롤링 빈도 제한

#### 2단계: 벡터 임베딩 (선택)

```bash
# Sentence Transformers 설치
pip install sentence-transformers chromadb

# 한국어 임베딩 모델 다운로드
# jhgan/ko-sroberta-multitask (추천)
```

```python
# embed_knowledge.py
from sentence_transformers import SentenceTransformer
import chromadb

# 한국어 임베딩 모델
model = SentenceTransformer('jhgan/ko-sroberta-multitask')

# ChromaDB 초기화
client = chromadb.Client()
collection = client.create_collection("reze_knowledge")

# 지식 베이스 로드
with open('reze_knowledge_extended.txt', 'r') as f:
    lines = f.readlines()

# 임베딩 및 저장
for i, line in enumerate(lines):
    if line.strip():
        embedding = model.encode(line)
        collection.add(
            embeddings=[embedding.tolist()],
            documents=[line],
            ids=[f"doc_{i}"]
        )

print(f"✅ {len(lines)}개 문장 임베딩 완료")
```

#### 3단계: RAG 검색 시스템

```python
# advanced_rag.py
from sentence_transformers import SentenceTransformer
import chromadb

class AdvancedRezeRAG:
    def __init__(self):
        self.model = SentenceTransformer('jhgan/ko-sroberta-multitask')
        self.client = chromadb.Client()
        self.collection = self.client.get_collection("reze_knowledge")
    
    def search(self, query, top_k=3):
        """벡터 유사도 검색"""
        query_embedding = self.model.encode(query)
        
        results = self.collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=top_k
        )
        
        return results['documents'][0]
    
    def enhance_prompt(self, user_message):
        """사용자 메시지에 관련 지식 추가"""
        relevant_docs = self.search(user_message)
        
        context = "\\n".join(relevant_docs)
        
        enhanced = f"""[레제 관련 정보]
{context}

[사용자 질문]
{user_message}

위 정보를 참고하되, 레제답게 자연스럽게 대화하세요."""
        
        return enhanced
```

---

## 🚀 통합 방법

### JavaScript (웹 인터페이스)

```javascript
// ollamaAPI.js 수정
import { rezeRAG } from './rezeRAG.js';

class OllamaAPI {
    constructor() {
        // ... 기존 코드 ...
        this.rag = null;
    }

    async init() {
        // RAG 초기화
        this.rag = rezeRAG;
        await this.rag.loadKnowledge();
    }

    async chat(userMessage) {
        // RAG로 메시지 강화
        const enhancedMessage = this.rag 
            ? this.rag.enhancePrompt(userMessage)
            : userMessage;

        // Ollama에 전달
        const messages = [
            { role: 'system', content: this.getRezeSystemPrompt() },
            ...this.conversationHistory,
            { role: 'user', content: enhancedMessage }
        ];

        // ... 나머지 코드 ...
    }
}
```

### Python (서버 사이드)

```python
# server.py
from flask import Flask, request, jsonify
from advanced_rag import AdvancedRezeRAG
import requests

app = Flask(__name__)
rag = AdvancedRezeRAG()

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message')
    
    # RAG로 프롬프트 강화
    enhanced = rag.enhance_prompt(user_message)
    
    # Ollama API 호출
    response = requests.post('http://localhost:11434/api/chat', json={
        'model': 'reze',
        'messages': [
            {'role': 'user', 'content': enhanced}
        ]
    })
    
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(port=5000)
```

---

## 📊 성능 비교

| 방법 | 정확도 | 속도 | 구현 난이도 | 맥북프로 2019 적합성 |
|------|--------|------|-------------|---------------------|
| **기본 Modelfile** | ⭐⭐⭐ | ⚡⚡⚡⚡⚡ | ⭐ | ✅ 최적 |
| **텍스트 검색 RAG** | ⭐⭐⭐⭐ | ⚡⚡⚡⚡ | ⭐⭐ | ✅ 좋음 |
| **벡터 임베딩 RAG** | ⭐⭐⭐⭐⭐ | ⚡⚡⚡ | ⭐⭐⭐⭐ | ⚠️ 느릴 수 있음 |
| **Fine-tuning** | ⭐⭐⭐⭐⭐ | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ❌ 학습 시간 김 |

---

## 💡 추천 방안

### 🎯 단계별 구현

#### 1단계: 현재 상태 (완료!) ✅
- `Modelfile.reze`에 기본 정보 포함
- 빠르고 간단함

#### 2단계: 텍스트 RAG (권장) 🟢
- `reze_knowledge.txt` + `rezeRAG.js` 사용
- 나무위키 내용 추가
- 구현 간단, 효과 좋음

#### 3단계: 벡터 RAG (고급) 🟡
- Sentence Transformers 사용
- 더 정확한 검색
- 서버 리소스 필요

#### 4단계: Fine-tuning (최종) 🔴
- Unsloth로 모델 재학습
- 최고 성능
- 시간과 리소스 많이 필요

---

## 🛠️ 빠른 시작 (텍스트 RAG)

```bash
# 1. 나무위키에서 레제 정보 복사
# 2. reze_knowledge.txt 파일에 추가
# 3. 웹 인터페이스 업데이트

# index.html에 추가
<script type="module">
    import { rezeRAG } from './rezeRAG.js';
    
    // 초기화
    await rezeRAG.loadKnowledge();
    console.log('✅ 레제 지식 베이스 로드됨');
</script>
```

---

## 📚 참고 자료

- [Ollama 공식 문서](https://ollama.ai/docs)
- [Sentence Transformers](https://www.sbert.net/)
- [ChromaDB](https://www.trychroma.com/)
- [나무위키 이용약관](https://namu.wiki/terms)

---

**질문 있으면 언제든 물어봐! 🚀**
